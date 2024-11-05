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
    .returning({ insertedId: schema.service.id });

  const insertedService = insertedServices[0];

  for (const method of methods) {
    const insertedMethods = await db
      .insert(schema.serviceMethod)
      .values({
        serviceId: insertedService.insertedId,
        active: true,
        name: method.name,
        recheckTime: method.recheckTime,
      })
      .returning({ insertedId: schema.serviceMethod.id });

    const insertedMethod = insertedMethods[0];

    for (const [name, title] of Object.entries(method.fields)) {
      await db.insert(schema.serviceMethodField).values({
        methodId: insertedMethod.insertedId,
        name,
        title,
        serviceId: insertedService.insertedId,
      });
    }
  }
};
