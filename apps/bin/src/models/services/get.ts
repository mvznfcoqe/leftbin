import { eq } from "drizzle-orm";
import { db, schema } from "@/schema";

export const getActiveServices = async () => {
  const services = await db
    .select()
    .from(schema.service)
    .where(eq(schema.service.active, true));

  return services;
};
