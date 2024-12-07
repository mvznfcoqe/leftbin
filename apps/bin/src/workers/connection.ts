import { env } from "@/env";
import IORedis from "ioredis";
import { logger } from "..";

export const connection = new IORedis({
  host: env.PARSER_REDIS_QUERY_HOST,
  port: env.PARSER_REDIS_QUERY_PORT,
});

logger.debug({
  service: "redis",
  host: env.PARSER_REDIS_QUERY_HOST,
  port: env.PARSER_REDIS_QUERY_PORT,
});
