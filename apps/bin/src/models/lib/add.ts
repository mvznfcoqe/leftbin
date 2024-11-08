import { db, schema } from "../../schema";
import type { Service } from "../service/lib";
import { getCurrentUser } from "../user";

export const addService = async ({
  baseUrl,
  name,
  methods,
  title,
}: Service["info"]) => {
  const insertedServices = await db
    .insert(schema.service)
    .values({ baseUrl, name, title })
    .returning();

  const insertedService = insertedServices[0];

  const user = await getCurrentUser();

  if (!user) {
    return;
  }

  for (const method of methods) {
    const insertedMethods = await db
      .insert(schema.serviceMethod)
      .values({
        serviceId: insertedService.id,
        name: method.name,
        type: "code",
        title: method.title,
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

    await db.insert(schema.userServiceMethod).values({
      serviceId: insertedService.id,
      methodId: insertedMethod.id,
      notifyAbout: "new",
      userId: user.id,
      recheckTime: method.recheckTime,
    });
  }
};
