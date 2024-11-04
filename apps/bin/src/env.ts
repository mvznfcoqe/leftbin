export const env = {
  PORT: process.env.PORT || 9001,
  NAME: process.env.NAME || "Bin Instance",
  AUTH_TOKEN: process.env.AUTH_TOKEN,

  PARSER_REDIS_QUERY_HOST: process.env.PARSER_REDIS_QUERY_HOST || "localhost",
  PARSER_REDIS_QUERY_PORT: process.env.PARSER_REDIS_QUERY_PORT || 6379,
};
