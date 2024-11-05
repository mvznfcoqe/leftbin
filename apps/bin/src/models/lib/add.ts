import { db, schema } from "../../schema";
import type { Service } from "../service/lib";

export const addService = async ({
  active,
  baseUrl,
  name,
  methods,
}: Service["info"]) => {
  const insertedServices = await db
    .insert(schema.service)
    .values({ active, baseUrl, name })
    .returning();

  const insertedService = insertedServices[0];

  for (const method of methods) {
    const insertedMethods = await db
      .insert(schema.serviceMethod)
      .values({
        serviceId: insertedService.id,
        active: true,
        name: method.name,
        recheckTime: method.recheckTime,
      })
      .returning();

    const insertedMethod = insertedMethods[0];

    for (const [name, title] of Object.entries(method.fields)) {
      await db.insert(schema.serviceMethodField).values({
        methodId: insertedMethod.id,
        name,
        title,
        serviceId: insertedService.id,
      });
    }
  }
};
