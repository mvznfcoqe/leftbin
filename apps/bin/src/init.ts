import { and, eq } from "drizzle-orm";
import { logger } from ".";
import { services } from "./models/service";
import { getMethodRecheckTime } from "./models/service/lib";
import { db, schema } from "./schema";
import { parserQueue, parserWorkerName } from "@/workers/parser";
import { getCurrentUser } from "./models/user";

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

  for (const activeMethod of activeMethods) {
    const { service, serviceMethod, userServiceMethod } = activeMethod;

    if (!service || !serviceMethod) {
      return;
    }

    const recheckTime = getMethodRecheckTime({
      recheckTime: userServiceMethod.recheckTime,
    });

    if (!recheckTime || recheckTime < 1000) {
      return;
    }

    await parserQueue.upsertJobScheduler(
      parserWorkerName,
      {
        every: recheckTime,
      },
      {
        data: { methodName: serviceMethod.name, serviceName: service.name },
        name: serviceMethod.name,
      }
    );

    logger.debug({
      service: service.name,
      method: serviceMethod.name,
      status: "Initialized repeatable job",
      recheckTime,
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
