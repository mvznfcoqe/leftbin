import { db, schema } from "@/schema";
import { env } from "@/env";
import type { BrowserContext } from "playwright";
import { and, eq } from "drizzle-orm";
import { services } from ".";

export type ServiceField = {
  title: string;
  name: string;
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
> = (params: {
  context: BrowserContext;
  params?: P;
}) => Promise<ServiceResponse<D>>;

export type ServiceMethod = {
  name: string;
  title: string;
  recheckTime?: number;
  fields: ServiceField[];
  fn: ServiceMethodFn;
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
      (previous) => previous.id.toString() === id.toString(),
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
      eq(schema.serviceData.methodId, methodId),
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

export {
  getMethodRecheckTime,
  getMethodNewData,
  getMethodPreviousDataByLastId,
  getMethodFnByName,
};
