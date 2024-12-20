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
import { launch } from "rebrowser-puppeteer-core";
import UserAgent from "user-agents";
import { connection } from "./connection";

export const parserWorkerName = "parserQueue";

export type ServiceParserJobData = {
  userMethodId?: number;
  serviceName: string;
  methodName: string;
  repeat?: boolean;
  query?: Record<string, string | undefined>;
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

    const userAgent = new UserAgent({ deviceCategory: "desktop" }).random();

    const browser = await launch({
      executablePath: env.CHROME_EXECUTABLE,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        `--user-agent=${userAgent.toString()}`,
        "--disable-blink-features=AutomationControlled",
        "--start-maximized",
      ],
      ignoreDefaultArgs: ["--enable-automation"],
      defaultViewport: {
        height: userAgent.data.screenHeight,
        width: userAgent.data.screenWidth,
      },
    });

    const page = await browser.newPage();

    const serviceCookies = await db.query.cookie.findMany({
      where: eq(schema.cookie.serviceId, methodData.service.id),
    });

    await browser.setCookie(
      ...serviceCookies.map(
        ({ name, domain, expires, httpOnly, path, secure, value }) => ({
          name,
          value,
          domain,
          expires,
          httpOnly: Boolean(httpOnly),
          path,
          secure: Boolean(secure),
          size: 200,
          session: false,
        })
      )
    );

    const result = await methodFn({ page, params: query });

    if (!result?.data) {
      throw new Error(`Failed to parse data for ${serviceName}, ${methodName}`);
    }

    return {
      ...result,
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
    console.log(parsed.data);
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
  const { message, method, service, userServiceMethod } = workerSuccessResult;

  const methodFields = await db.query.serviceMethodField
    .findMany({
      where: and(
        eq(schema.serviceMethodField.serviceId, service.id),
        eq(schema.serviceMethodField.methodId, method.id)
      ),
    })
    .then((fields) => {
      return fields.map((field) => {
        return { name: field.name, title: field.title };
      });
    });

  const serviceDataForNotifications = await getMethodData({
    serviceId: service.id,
    methodId: method.id,
    notifyAbout: userServiceMethod.notifyAbout,
    parsed: {
      ...workerSuccessResult,
    },
  });

  const formattedData = formatServiceMethodData({
    data: serviceDataForNotifications,
    method: {
      title: method.title,
      name: method.name,
      fields: methodFields,
    },
  });

  await notify({
    message: `
Service: ${service.title}
Method: ${method.title}
${message}
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
