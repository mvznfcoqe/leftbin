import { db, schema } from "@/schema";
import { eq } from "drizzle-orm";

export const getActiveMethods = async () => {
  const methods = await db
    .select({ serviceMethod: schema.serviceMethod })
    .from(schema.userServiceMethod)
    .where(eq(schema.userServiceMethod.active, true))
    .innerJoin(
      schema.serviceMethod,
      eq(schema.userServiceMethod.methodId, schema.serviceMethod.id)
    );

  return methods.map(({ serviceMethod }) => {
    return {
      id: serviceMethod.id,
      name: serviceMethod.name,
      title: serviceMethod.title,
    };
  });
};

export const getServices = async () => {
  const services = await db.select().from(schema.service);

  return services.map(({ id, title, name, baseUrl }) => {
    return {
      id,
      title,
      name,
      baseUrl,
    };
  });
};
