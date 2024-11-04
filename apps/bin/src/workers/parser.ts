import { services } from "@/models/service";
import { Job, Queue, Worker } from "bullmq";
import { firefox } from "playwright";

import IORedis from "ioredis";
import { logger } from "..";
import type { ServiceResponse } from "@/models/lib/types";

const connection = new IORedis({ maxRetriesPerRequest: 0 });

export const parserWorkerName = "parserQueue";

export type ServiceParserJobData = {
  serviceName: string;
  methodName: string;
  query: Record<string, string>;
};

export const parserQueue = new Queue<ServiceParserJobData>(parserWorkerName, {
  connection,
});

const worker = new Worker(
  parserWorkerName,
  async ({ data }: Job<ServiceParserJobData, ServiceResponse>) => {
    const { methodName, query, serviceName } = data;

    const service = services[serviceName];
    const methodFn = service[methodName];

    const browser = await firefox.launch();
    const context = await browser.newContext();

    const parsed = await methodFn(context, query);

    return parsed;
  },
  {
    connection,
  }
);

worker.on("completed", (job) => {
  if (!job.returnvalue) {
    logger.error({
      jobId: job.id,
      service: job.data.serviceName,
      method: job.data.methodName,
      error: `Parser returned undefined`,
    });

    return;
  }

  logger.debug({
    jobId: job.id,
    service: job.data.serviceName,
    method: job.data.methodName,
    parsedItemsCount: job.returnvalue.data.length,
    timeRequired: `${(Date.now() - job.timestamp) / 1000} seconds`,
  });
});
