import { db, schema } from "../../schema";

export const addService = async (
  serviceInfo: typeof schema.service.$inferInsert
) => {
  return await db
    .insert(schema.service)
    .values(serviceInfo)
    .onConflictDoNothing();
};
