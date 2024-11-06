import { db, schema } from "@/schema";

export const getActiveServices = async () => {
  const services = await db.select().from(schema.service);

  return services;
};
