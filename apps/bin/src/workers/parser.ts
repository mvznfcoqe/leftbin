import { services } from "@/models/service";
import { Job, Queue, Worker } from "bullmq";
import { firefox } from "playwright";
import { logger } from "..";

import { connection } from "./connection";
import { bot } from "@/bot";
import { db, schema } from "@/schema";
import { eq } from "drizzle-orm";
import { formatServiceMethodData } from "@/models/notifications/lib";
import type { ServiceResponse } from "@/models/service/lib";

export const parserWorkerName = "parserQueue";

export type ServiceParserJobData = {
  serviceName: string;
  methodName: string;
  query?: Record<string, string>;
};

export const parserQueue = new Queue<ServiceParserJobData>(parserWorkerName, {
  connection,
});

export const parserWorker = new Worker(
  parserWorkerName,
  async ({ data }: Job<ServiceParserJobData, ServiceResponse>) => {
    const { methodName, query, serviceName } = data;

    const service = services.find(
      (service) => service.info.name === serviceName
    );

    if (!service) {
      return;
    }

    const methodInfo = service.info.methods.find(
      (method) => method.name === methodName
    );

    if (!methodInfo) {
      return;
    }

    const methodFn = service.methods[methodName];

    const browser = await firefox.launch();
    const context = await browser.newContext();

    const parsed = await methodFn({ context, params: query });

    if (!parsed?.data) {
      return;
    }

    const user = await db.query.user.findFirst({
      where: eq(schema.user.name, "admin"),
    });

    if (!user || !user.telegramId) {
      return parsed;
    }

    const formattedData = formatServiceMethodData({
      data: parsed?.data,
      method: methodInfo,
    });

    await bot.api.sendMessage(
      user.telegramId,
      `
Сервис: ${service.info.title}
${formattedData}
      `
    );

    return parsed;
  },
  {
    connection,
    concurrency: 5,
    removeOnFail: { count: 0 },
  }
);

parserWorker.on("completed", (job) => {
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
  });
});
