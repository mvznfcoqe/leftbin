import { db, schema } from "../../schema";
import type { Service } from "../service/lib";

export const addService = async ({
  baseUrl,
  name,
  methods,
}: Service["info"]) => {
  const insertedServices = await db
    .insert(schema.service)
    .values({ baseUrl, name })
    .returning();

  const insertedService = insertedServices[0];

  for (const method of methods) {
    const insertedMethods = await db
      .insert(schema.serviceMethod)
      .values({
        serviceId: insertedService.id,

        name: method.name,
        recheckTime: method.recheckTime,
      })
      .returning();

    const insertedMethod = insertedMethods[0];

    for (const field of method.fields) {
      await db.insert(schema.serviceMethodField).values({
        methodId: insertedMethod.id,
        name: field.name,
        title: field.title,
        serviceId: insertedService.id,
      });
    }
  }
};
