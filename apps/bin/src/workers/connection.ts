import { env } from "@/env";
import { logger } from "@/logger";
import IORedis from "ioredis";

export const connection = new IORedis({
  maxRetriesPerRequest: null,
  host: env.PARSER_REDIS_QUERY_HOST,
  port: env.PARSER_REDIS_QUERY_PORT,
});

logger.debug({
  service: "redis",
  host: env.PARSER_REDIS_QUERY_HOST,
  port: env.PARSER_REDIS_QUERY_PORT,
});
