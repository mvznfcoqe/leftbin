import IORedis from "ioredis";

export const connection = new IORedis({
  maxRetriesPerRequest: 0,
  offlineQueue: false,
});
