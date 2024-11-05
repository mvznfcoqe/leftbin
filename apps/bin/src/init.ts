import { logger } from ".";
import { services } from "./models/service";
import { getMethodRecheckTime } from "./models/service/lib";
import { db, schema } from "./schema";
import { parserQueue, parserWorkerName } from "./workers/parser";

const initBin = async (bin: typeof schema.bin.$inferInsert) => {
  await db.insert(schema.bin).values(bin);
};

const initServices = async () => {
  for (const service of services) {
    if (service.init) {
      await service.init();
    }
  }
};

const startRepeatableJobs = async () => {
  for (const service of services) {
    for (const method of service.info.methods) {
      const recheckTime = getMethodRecheckTime({
        recheckTime: method.recheckTime,
      });

      await parserQueue.add(
        parserWorkerName,
        { methodName: method.name, serviceName: service.info.name },
        {
          repeat: {
            every: recheckTime,
          },
          removeOnFail: true,
        }
      );

      logger.debug({
        service: service.info.name,
        method: method.name,
        status: "Initialized repeatable job",
        recheckTime,
      });
    }
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
