import { bot } from "@/bot";
import { env } from "@/env";
import { addParserJob } from "@/init";
import { logger } from "@/logger";
import { formatServiceMethodData } from "@/models/notifications";
import {
  getMethodFnByName,
  getMethodNewData,
  getMethodPreviousDataByLastId,
  type ServiceResponse,
} from "@/models/service";
import { getCurrentUser } from "@/models/user";
import { db, schema } from "@/schema";
import { Job, Queue, Worker } from "bullmq";
import { and, eq } from "drizzle-orm";
import { launch } from "puppeteer-core";
import { connection } from "./connection";

export const parserWorkerName = "parserQueue";

export type ServiceParserJobData = {
  userMethodId?: number;
  serviceName: string;
  methodName: string;
  repeat?: boolean;
  query?: Record<string, string>;
};

export const parserQueue = new Queue<ServiceParserJobData>(parserWorkerName, {
  connection,
});

const getMethodData = async ({
  serviceId,
  methodId,
  parsed,
  notifyAbout,
}: {
  serviceId: typeof schema.service.$inferSelect.id;
  methodId: typeof schema.serviceMethod.$inferSelect.id;
  notifyAbout: typeof schema.userServiceMethod.$inferSelect.notifyAbout;
  parsed: ServiceResponse;
}) => {
  if (!parsed) {
    return [];
  }

  if (notifyAbout === "all") {
    return parsed.data;
  }

  const previousData = await getMethodPreviousDataByLastId({
    serviceId,
    methodId,
    lastInsertedId: parsed.insertedId,
  });

  const newData = getMethodNewData({
    data: parsed.data,
    previousData,
  });

  return newData;
};

export const parserWorker = new Worker(
  parserWorkerName,
  async ({ data }: Job<ServiceParserJobData, ServiceResponse>) => {
    const { methodName, query, serviceName } = data;

    const methodData = await db
      .selectDistinct({
        serviceMethod: schema.serviceMethod,
        service: schema.service,
        userServiceMethod: schema.userServiceMethod,
      })
      .from(schema.service)
      .where(eq(schema.service.name, serviceName))
      .leftJoin(
        schema.serviceMethod,
        and(
          eq(schema.serviceMethod.serviceId, schema.service.id),
          eq(schema.serviceMethod.name, methodName)
        )
      )
      .leftJoin(
        schema.userServiceMethod,
        and(
          eq(schema.userServiceMethod.methodId, schema.serviceMethod.id),
          eq(schema.userServiceMethod.serviceId, schema.service.id)
        )
      )
      .then((methods) => {
        return methods[0];
      });

    if (!methodData.serviceMethod || !methodData.userServiceMethod) {
      throw new Error("Failed to get methodData");
    }

    const methodFn = await getMethodFnByName({ serviceName, methodName });

    if (!methodFn) {
      throw new Error(`Failed to find fn for ${serviceName}, ${methodName}`);
    }

    const browser = await launch({
      executablePath: env.CHROME_EXECUTABLE,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();

    const serviceCookies = await db.query.cookie.findMany({
      where: eq(schema.cookie.serviceId, methodData.service.id),
    });

    await page.setCookie(
      ...serviceCookies.map(
        ({ name, domain, expires, httpOnly, path, secure, value }) => ({
          name,
          value,
          domain,
          expires,
          httpOnly: Boolean(httpOnly),
          path,
          secure: Boolean(secure),
        })
      )
    );

    const parsed = await methodFn({ page, params: query });

    if (!parsed?.data) {
      throw new Error(`Failed to parse data for ${serviceName}, ${methodName}`);
    }

    const user = await getCurrentUser();

    if (!user || !user.telegramId) {
      return parsed;
    }

    const methodFields = await db.query.serviceMethodField
      .findMany({
        where: and(
          eq(schema.serviceMethodField.serviceId, methodData.service.id),
          eq(schema.serviceMethodField.methodId, methodData.serviceMethod.id)
        ),
      })
      .then((fields) => {
        return fields.map((field) => {
          return { name: field.name, title: field.title };
        });
      });

    const serviceDataForNotifications = await getMethodData({
      methodId: methodData.serviceMethod.id,
      serviceId: methodData.service.id,
      notifyAbout: methodData.userServiceMethod.notifyAbout,
      parsed,
    });

    if (!serviceDataForNotifications || !serviceDataForNotifications.length) {
      return;
    }

    const formattedData = formatServiceMethodData({
      data: serviceDataForNotifications,
      method: {
        title: methodData.serviceMethod.title,
        name: methodData.serviceMethod.name,
        fields: methodFields,
      },
    });

    await bot.api.sendMessage(
      user.telegramId,
      `
Сервис: ${methodData.service.title}
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

parserWorker.on("completed", async (job) => {
  logger.debug({
    jobId: job.id,
    service: job.data.serviceName,
    method: job.data.methodName,
    parsedItemsCount: job.returnvalue ? job.returnvalue.data.length : 0,
  });

  await addParserJob({ ...job.data });
});

parserWorker.on("failed", async (job, err) => {
  if (!job) {
    return;
  }

  logger.debug({
    jobId: job.id,
    service: job.data.serviceName,
    method: job.data.methodName,
    status: "Failed job",
    error: err.message,
  });
});
