import dotnev from "dotenv";

export type NODE_ENV = "development";

dotnev.config();

export const env = {
  NODE_ENV: (process.env.NODE_ENV || "development") as NODE_ENV,

  PORT: Number(process.env.PORT) || 9001,
  HOSTNAME: process.env.HOSTNAME || "127.0.0.1",
  NAME: process.env.NAME || "Bin Instance",
  AUTH_TOKEN: process.env.AUTH_TOKEN || "",
  MIGRATE: Boolean(Number(process.env.MIGRATE)) || false,
  START_ALL_USER_METHODS: Boolean(Number(process.env.START_ALL_USER_METHODS)),

  BASE_RECHECK_TIME: process.env.BASE_RECHECK_TIME
    ? Number(process.env.BASE_RECHECK_TIME)
    : null,
  RANDOMIZE_RECHECK_TIME: Boolean(Number(process.env.RANDOMIZE_RECHECK_TIME)),

  PARSER_REDIS_QUERY_HOST: process.env.PARSER_REDIS_QUERY_HOST || "0.0.0.0",
  PARSER_REDIS_QUERY_PORT: Number(process.env.PARSER_REDIS_QUERY_PORT) || 6379,
  BOT_TOKEN: process.env.BOT_TOKEN || "",
  DATABASE_URL: process.env.DATABASE_URL || "",
  CHROME_EXECUTABLE: process.env.CHROME_EXECUTABLE,
};
