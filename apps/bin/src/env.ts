export type NODE_ENV = "development";

export const env = {
  PORT: Number(process.env.PORT) || 9001,
  NAME: process.env.NAME || "Bin Instance",
  AUTH_TOKEN: process.env.AUTH_TOKEN || "",

  PARSER_REDIS_QUERY_HOST: process.env.PARSER_REDIS_QUERY_HOST || "localhost",
  PARSER_REDIS_QUERY_PORT: Number(process.env.PARSER_REDIS_QUERY_PORT) || 6379,

  BASE_RECHECK_TIME: Number(process.env.BASE_RECHECK_TIME) || 7200000,
  RANDOMIZE_RECHECK_TIME: Boolean(Number(process.env.RANDOMIZE_RECHECK_TIME)),

  NODE_ENV: (process.env.NODE_ENV || "development") as NODE_ENV,
  BOT_TOKEN: process.env.BOT_TOKEN || "",
  DATABASE_URL: process.env.DATABASE_URL || "",
};
