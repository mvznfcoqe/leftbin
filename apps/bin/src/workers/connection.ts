import { env } from "@/env";
import IORedis from "ioredis";

export const connection = new IORedis({
  offlineQueue: false,
  host: env.PARSER_REDIS_QUERY_HOST,
  port: env.PARSER_REDIS_QUERY_PORT,
});
