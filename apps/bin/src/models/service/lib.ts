import type { schema } from "@/schema";
import type { ServiceMethodFn } from "../lib/types";
import { env } from "@/env";

export type Service = {
  init?: () => Promise<void>;
  info: {
    name: string;
    baseUrl: string;
    active: boolean;
    methods: {
      name: string;
      recheckTime?: number;
      fields: Record<string, string>;
      fn: ServiceMethodFn;
    }[];
  };
  methods: Record<string, ServiceMethodFn>;
};

export const getMethodRecheckTime = ({
  recheckTime,
}: {
  recheckTime?: typeof schema.serviceMethod.$inferSelect.recheckTime;
}) => {
  const time = recheckTime || env.BASE_RECHECK_TIME;

  // if (env.RANDOMIZE_RECHECK_TIME) {
  //   const randomRecheckTime = Math.floor(Math.random() * time);

  //   return randomRecheckTime;
  // }

  return time;
};
