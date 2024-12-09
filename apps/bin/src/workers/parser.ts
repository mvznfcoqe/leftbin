import { env } from "@/env";
import { addParserJob } from "@/init";
import { logger } from "@/logger";
import { formatServiceMethodData, notify } from "@/models/notifications";
import {
  getMethodFnByName,
  getMethodNewData,
  getMethodPreviousDataByLastId,
  type ServiceResponse,
} from "@/models/service";

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

type WorkerSuccessResult = ServiceResponse & {
  service: typeof schema.service.$inferSelect;
  method: typeof schema.serviceMethod.$inferSelect;
  userServiceMethod: typeof schema.userServiceMethod.$inferSelect;
};

export const parserWorker = new Worker(
  parserWorkerName,
  async ({ data }: Job<ServiceParserJobData, WorkerSuccessResult>) => {
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

    return {
      ...parsed,
      service: methodData.service,
      method: methodData.serviceMethod,
      userServiceMethod: methodData.userServiceMethod,
    };
  },
  {
    connection,
    concurrency: 5,
    removeOnFail: { count: 0 },
  }
);

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

const notifyWorkerCompleted = async ({
  workerSuccessResult,
}: {
  workerSuccessResult: WorkerSuccessResult;
}) => {
  const methodFields = await db.query.serviceMethodField
    .findMany({
      where: and(
        eq(schema.serviceMethodField.serviceId, workerSuccessResult.service.id),
        eq(schema.serviceMethodField.methodId, workerSuccessResult.method.id)
      ),
    })
    .then((fields) => {
      return fields.map((field) => {
        return { name: field.name, title: field.title };
      });
    });

  const serviceDataForNotifications = await getMethodData({
    serviceId: workerSuccessResult.service.id,
    methodId: workerSuccessResult.method.id,
    notifyAbout: workerSuccessResult.userServiceMethod.notifyAbout,
    parsed: {
      data: workerSuccessResult.data,
      insertedId: workerSuccessResult.insertedId,
    },
  });

  const formattedData = formatServiceMethodData({
    data: serviceDataForNotifications,
    method: {
      title: workerSuccessResult.method.title,
      name: workerSuccessResult.method.name,
      fields: methodFields,
    },
  });

  await notify({
    message: `
Service: ${workerSuccessResult.service.title}
${formattedData}
`,
  });
};

parserWorker.on("completed", async (job) => {
  const workerSuccessResult = job.returnvalue;

  logger.debug({
    jobId: job.id,
    service: job.data.serviceName,
    method: job.data.methodName,
    parsedItemsCount: workerSuccessResult ? workerSuccessResult.data.length : 0,
  });

  if (workerSuccessResult) {
    await notifyWorkerCompleted({ workerSuccessResult });
  }

  if (job.data.repeat) {
    await addParserJob({ ...job.data });
  }
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

  await notify({
    message: `
Service: ${job.data.serviceName}
Method: ${job.data.methodName}
An error occurred during the service execution, and the service has been stopped.
  `,
  });
});
