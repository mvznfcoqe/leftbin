import {
  parserQueue,
  parserWorkerName,
  ServiceParserJobData,
} from "@/workers/parser";
import { Job } from "bullmq";
import { and, eq } from "drizzle-orm";
import { logger } from ".";
import { services } from "./models/service";
import { getMethodRecheckTime } from "./models/service/lib";
import { getCurrentUser } from "./models/user";
import { db, schema } from "./schema";

const initBin = async (bin: typeof schema.bin.$inferInsert) => {
  await db.insert(schema.bin).values(bin);
  await db.insert(schema.user).values({ name: "admin" });
};

const initServices = async () => {
  for (const service of services) {
    if (service.init) {
      await service.init();
    }
  }
};

const getJobParserName = ({
  method,
  service,
  userMethodId,
}: {
  userMethodId: number;
  service: string;
  method: string;
}) => {
  return `[${parserWorkerName}]: ${userMethodId} ${service} ${method}`;
};

const getIsHasJobForUserMethod = async ({
  jobs,
  userMethodId,
}: {
  jobs: Job<ServiceParserJobData, any, string>[];
  userMethodId: number;
}) => {
  return jobs.some((job) => job.data.userMethodId === userMethodId);
};

export const addParserJob = async ({
  userMethodId,
  serviceName,
  methodName,
}: {
  userMethodId: number;
  serviceName: string;
  methodName: string;
}) => {
  const userServiceMethod = await db.query.userServiceMethod.findFirst({
    where: eq(schema.userServiceMethod.id, userMethodId),
  });

  if (!userServiceMethod) {
    throw new Error("Failed to get userServiceMethod");
  }

  const recheckTime = getMethodRecheckTime({
    recheckTime: userServiceMethod.recheckTime,
    randomizeRecheckTime: Boolean(userServiceMethod.randomizeRecheckTime),
  });

  if (!recheckTime || recheckTime < 1000) {
    throw new Error("Invalid recheck time");
  }

  await parserQueue.add(
    getJobParserName({
      userMethodId,
      service: serviceName,
      method: methodName,
    }),
    {
      userMethodId,
      methodName,
      serviceName,
    },
    {
      delay: recheckTime,
    }
  );

  logger.debug({
    service: serviceName,
    method: methodName,
    status: "Initialized repeatable job",
    recheckTime,
  });

  return { recheckTime };
};

const startRepeatableJobs = async () => {
  const user = await getCurrentUser();

  if (!user) {
    return;
  }

  const activeMethods = await db
    .select({
      service: schema.service,
      userServiceMethod: schema.userServiceMethod,
      serviceMethod: schema.serviceMethod,
    })
    .from(schema.userServiceMethod)
    .where(
      and(
        eq(schema.userServiceMethod.active, true),
        eq(schema.userServiceMethod.userId, user.id)
      )
    )
    .leftJoin(
      schema.service,
      eq(schema.service.id, schema.userServiceMethod.serviceId)
    )
    .leftJoin(
      schema.serviceMethod,
      and(
        eq(schema.serviceMethod.id, schema.userServiceMethod.methodId),
        eq(schema.serviceMethod.serviceId, schema.userServiceMethod.serviceId)
      )
    );

  const jobs = await parserQueue.getJobs([
    "active",
    "delayed",
    "paused",
    "wait",
    "waiting",
    "waiting-children",
  ]);

  for (const activeMethod of activeMethods) {
    const { service, serviceMethod, userServiceMethod } = activeMethod;

    const isHasJobForUserMethod = await getIsHasJobForUserMethod({
      jobs,
      userMethodId: userServiceMethod.id,
    });

    if (isHasJobForUserMethod) {
      return;
    }

    if (!service || !serviceMethod || !userServiceMethod.recheckTime) {
      return;
    }

    await addParserJob({
      userMethodId: userServiceMethod.id,
      methodName: serviceMethod.name,
      serviceName: service.name,
    });
  }
};

const init = async ({
  bin,
}: {
  bin: Omit<typeof schema.bin.$inferInsert, "initialized">;
}) => {
  await initBin({ ...bin, initialized: true });
  await initServices();
};

export { init, startRepeatableJobs };
