import { env } from "@/env";
import { logger } from "@/logger";
import { db, schema } from "@/schema";
import { defaultNotifyAbout } from "@/schema/schema";
import { and, eq } from "drizzle-orm";
import type { Page } from "rebrowser-puppeteer-core";
import { services } from ".";
import { getCurrentUser } from "../user";
import { gotoTimeout } from "./config";

export type ServiceField = {
  title: string;
  name: string;
};

export type ServiceMethodParameter = string | number | undefined;

export type ServiceMethodParameters = Record<string, ServiceMethodParameter>;

export type ServiceMethodData = {
  id: string | number;
  [x: string]: string | number;
}[];

export type ServiceMethodActionResult<D = ServiceMethodData> = {
  data: D;
  message: string;
  status: "success" | "failure";
};

export type ServiceMethodAction<P = ServiceMethodParameters> = (params: {
  page: Page;
  service: typeof schema.service.$inferSelect;
  method: typeof schema.serviceMethod.$inferSelect;
  params?: P;
}) => Promise<ServiceMethodActionResult>;

export type ServiceResponse<D = ServiceMethodData> =
  | ({ insertedId: number } & ServiceMethodActionResult<D>)
  | undefined;

export type ServiceMethodFn<
  P = ServiceMethodParameters,
  D = ServiceMethodData,
> = (params: { page: Page; params?: P }) => Promise<ServiceResponse<D>>;

export type ServiceMethod = {
  name: string;
  title: string;
  recheckTime?: number;
  baseUrl?: string;
  isCookiesRequired?: boolean;
  fields: ServiceField[];
  fn: ServiceMethodFn;
  notifyAbout?: typeof schema.userServiceMethod.$inferSelect.notifyAbout;

  parameters: Omit<
    typeof schema.serviceMethodParameter.$inferSelect,
    "createdAt" | "updatedAt" | "serviceId" | "methodId" | "id"
  >[];
};

export type Service = {
  init?: () => Promise<void>;
  info: {
    name: string;
    title: string;
    baseUrl: string;
    methods: ServiceMethod[];
  };
  methods: Record<string, ServiceMethodFn>;
};

const getMethodRecheckTime = ({
  recheckTime,
  randomizeRecheckTime,
}: {
  recheckTime?: typeof schema.userServiceMethod.$inferSelect.recheckTime;
  randomizeRecheckTime?: boolean;
}) => {
  const time = recheckTime || env.BASE_RECHECK_TIME;

  if (!time) {
    return 0;
  }

  if (!randomizeRecheckTime) {
    return time;
  }

  const step = time * 0.5;

  return time + Math.floor(Math.random() * (2 * step + 1)) - step;
};

const getMethodNewData = ({
  previousData,
  data,
}: {
  previousData: ServiceMethodData;
  data: ServiceMethodData;
}) => {
  const newData = data.filter(({ id }) => {
    return !previousData.some(
      (previous) => previous.id.toString() === id.toString()
    );
  });

  return newData;
};

const getMethodPreviousDataByLastId = async ({
  lastInsertedId,
  serviceId,
  methodId,
}: {
  lastInsertedId: number;
  serviceId: typeof schema.service.$inferSelect.id;
  methodId: typeof schema.serviceData.$inferSelect.methodId;
}) => {
  const previousDataId = lastInsertedId - 1;
  const previousData = await db.query.serviceData.findFirst({
    where: and(
      eq(schema.serviceData.id, previousDataId),
      eq(schema.serviceData.serviceId, serviceId),
      eq(schema.serviceData.methodId, methodId)
    ),
  });

  return previousData?.data || [];
};

const getMethodFnByName = async ({
  methodName,
  serviceName,
}: {
  methodName: typeof schema.serviceMethod.$inferSelect.name;
  serviceName: typeof schema.service.$inferSelect.name;
}) => {
  const service = services.find((service) => service.info.name === serviceName);

  if (!service) {
    return;
  }

  const methodFn = service.methods[methodName];

  if (!methodFn) {
    return;
  }

  return methodFn;
};

const adaptServiceMethods = (info: Service["info"]) => {
  return info.methods.reduce(
    (acc, method) => {
      acc[method.name] = method.fn;

      return acc;
    },
    {} as Record<string, ServiceMethodFn>
  );
};

const isUrl = (string: string) => {
  return string.startsWith("http");
};

const getMethodUrl = ({
  methodBaseUrl,
  serviceBaseUrl,
}: {
  serviceBaseUrl: typeof schema.service.$inferSelect.baseUrl;
  methodBaseUrl: typeof schema.serviceMethod.$inferSelect.baseUrl;
}) => {
  if (!methodBaseUrl) {
    return serviceBaseUrl;
  }

  if (methodBaseUrl && isUrl(methodBaseUrl)) {
    return methodBaseUrl;
  }

  return new URL(methodBaseUrl, serviceBaseUrl).href;
};

const getMethodInfo = async ({
  methodName,
  serviceName,
}: {
  serviceName: string;
  methodName: string;
}) => {
  const services = await db
    .select()
    .from(schema.service)
    .where(eq(schema.service.name, serviceName));

  const service = services[0];

  if (!service) return;

  const method = await db.query.serviceMethod.findFirst({
    where: and(
      eq(schema.serviceMethod.name, methodName),
      eq(schema.serviceMethod.serviceId, service.id)
    ),
  });

  if (!method) return;

  const baseUrl = getMethodUrl({
    methodBaseUrl: method.baseUrl,
    serviceBaseUrl: service.baseUrl,
  });

  return { service, method, baseUrl };
};

const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const addService = async ({
  baseUrl,
  name,
  methods,
  title,
}: Service["info"]) => {
  const insertedServices = await db
    .insert(schema.service)
    .values({ baseUrl, name, title })
    .returning();

  const insertedService = insertedServices[0];

  const user = await getCurrentUser();

  if (!user) {
    return;
  }

  for (const method of methods) {
    const insertedMethods = await db
      .insert(schema.serviceMethod)
      .values({
        serviceId: insertedService.id,
        name: method.name,
        type: "code",
        title: method.title,
        baseUrl: method.baseUrl,
        isCookiesRequired: method.isCookiesRequired,
      })
      .returning();

    const insertedMethod = insertedMethods[0];

    for (const field of method.fields) {
      await db.insert(schema.serviceMethodField).values({
        methodId: insertedMethod.id,
        name: field.name,
        title: field.title,
        serviceId: insertedService.id,
      });
    }

    if (env.START_ALL_USER_METHODS) {
      await db.insert(schema.userServiceMethod).values({
        active: true,
        serviceId: insertedService.id,
        methodId: insertedMethod.id,
        notifyAbout: method.notifyAbout || defaultNotifyAbout,
        userId: user.id,
        recheckTime: method.recheckTime,
        randomizeRecheckTime: true,
      });
    }
  }
};

export const handleServiceMethodStarted = async ({
  page,
  serviceName,
  methodName,
}: {
  serviceName: string;
  methodName: string;
  page: Page;
}) => {
  const methodInfo = await getMethodInfo({
    methodName: methodName,
    serviceName: serviceName,
  });

  if (!methodInfo) {
    throw new Error(
      `Failed to get method info for service: "${serviceName}", method: "${methodName}"`
    );
  }

  logger.info(
    `Service: "${methodInfo.service.title}", Method: "${methodInfo.method.title}" started`
  );

  await page.goto(methodInfo.baseUrl, { timeout: gotoTimeout });
  await sleep(1000);

  return { methodInfo };
};

export const handleServiceMethodSucced = async <
  T extends ServiceMethodActionResult,
>({
  page,
  service,
  method,
  result,
}: {
  service: typeof schema.service.$inferSelect;
  method: typeof schema.serviceMethod.$inferSelect;
  result: T;
  page: Page;
}) => {
  await page.close();

  if (!result.data) {
    return;
  }

  const inserted = await db
    .insert(schema.serviceData)
    .values({ serviceId: service.id, methodId: method.id, data: result.data })
    .returning();

  const insertedData = inserted[0];

  logger.info(
    `Service: "${service.title}", Method: "${method.title}" succed with message: ${result.message}`
  );

  return {
    ...result,
    insertedId: insertedData.id,
  };
};

const createServiceMethodFn = <P = ServiceMethodParameters>({
  serviceName,
  methodName,
  fn,
}: {
  serviceName: string;
  methodName: string;
  fn: ServiceMethodAction<P>;
}): ServiceMethodFn<P> => {
  return async ({ page, params }) => {
    try {
      const { methodInfo } = await handleServiceMethodStarted({
        page,
        methodName,
        serviceName,
      });

      const { service, method } = methodInfo;

      const result = await fn({
        page,
        service,
        method,
        params,
      });

      if (!result) {
        return;
      }

      return await handleServiceMethodSucced({
        page,
        service,
        method,
        result,
      });
    } catch (e) {
      console.log(e);
    }
  };
};

export {
  adaptServiceMethods,
  addService,
  createServiceMethodFn,
  getMethodFnByName,
  getMethodInfo,
  getMethodNewData,
  getMethodPreviousDataByLastId,
  getMethodRecheckTime,
  sleep,
  getMethodUrl,
};
