import { db, schema } from "@/schema";
import { env } from "@/env";
import type { Page } from "puppeteer-core";
import { and, eq } from "drizzle-orm";
import { services } from ".";

export type ServiceField = {
  title: string;
  name: string;
};

export type ServiceParameter = {
  name: string;
  title: string;
  required: boolean;
  description?: string;
};

export type ServiceMethodData = {
  id: string | number;
  [x: string]: string | number;
}[];

export type ServiceResponse<D = ServiceMethodData> =
  | { data: D; insertedId: number }
  | undefined;
export type ServiceMethodFn<
  P = Record<string, unknown>,
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

  parameters: ServiceParameter[];
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
}: {
  recheckTime?: typeof schema.userServiceMethod.$inferSelect.recheckTime;
}) => {
  const time = recheckTime || env.BASE_RECHECK_TIME;

  if (!time) {
    return 0;
  }

  if (env.RANDOMIZE_RECHECK_TIME) {
    const randomRecheckTime = Math.floor(Math.random() * time) + time;

    return randomRecheckTime;
  }

  return time;
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

export const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export {
  getMethodRecheckTime,
  getMethodNewData,
  getMethodPreviousDataByLastId,
  getMethodFnByName,
  adaptServiceMethods,
  getMethodInfo,
};
