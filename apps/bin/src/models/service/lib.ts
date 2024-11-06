import type { schema } from "@/schema";
import { env } from "@/env";
import type { BrowserContext } from "playwright";

export type ServiceField = {
  title: string;
  name: string;
};

export type ServiceMethodData = Record<string, unknown>[];

export type ServiceResponse = { data: ServiceMethodData } | undefined;
export type ServiceMethodFn<P = Record<string, unknown>> = (params: {
  context: BrowserContext;
  params?: P;
}) => Promise<ServiceResponse>;

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
  recheckTime?: typeof schema.serviceMethod.$inferSelect.recheckTime;
}) => {
  const time = recheckTime || env.BASE_RECHECK_TIME;

  if (env.RANDOMIZE_RECHECK_TIME) {
    const randomRecheckTime = Math.floor(Math.random() * time) + time;

    return randomRecheckTime;
  }

  return time;
};

export { getMethodRecheckTime };
