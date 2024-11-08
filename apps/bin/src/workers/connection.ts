import { env } from "@/env";
import IORedis from "ioredis";

export const connection = new IORedis({
  maxRetriesPerRequest: 0,
  offlineQueue: false,
  host: env.PARSER_REDIS_QUERY_HOST,
  port: env.PARSER_REDIS_QUERY_PORT,
});
