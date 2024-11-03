import { db, schema } from "./schema";
import { aviasalesVacanciesService } from "@/models/service/aviasales-vacancies";

const initBin = async (bin: typeof schema.bin.$inferInsert) => {
  await db.insert(schema.bin).values(bin);
};

const initServices = async () => {
  await aviasalesVacanciesService.init();
};

const init = async ({
  bin,
}: {
  bin: Omit<typeof schema.bin.$inferInsert, "initialized">;
}) => {
  await initBin({ ...bin, initialized: true });
  await initServices();
};

export { init };
