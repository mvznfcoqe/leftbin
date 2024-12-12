import { db, schema } from "@/schema";
import { eq } from "drizzle-orm";
import { getMethodUrl } from "./lib";

const adaptMethod = ({
  method,
  service,
}: {
  method: typeof schema.serviceMethod.$inferSelect;
  service: typeof schema.service.$inferSelect;
}) => {
  return {
    id: method.id,
    name: method.name,
    title: method.title,
    isCookiesRequired: method.isCookiesRequired,
    type: method.type,
    url: getMethodUrl({
      methodBaseUrl: method.baseUrl,
      serviceBaseUrl: service.baseUrl,
    }),
  };
};

export const getMethodsById = async ({
  id,
}: {
  id: typeof schema.service.$inferSelect.id;
}) => {
  const service = await db.query.service.findFirst({
    where: eq(schema.service.id, id),
  });

  if (!service) {
    return;
  }

  const methods = await db
    .select()
    .from(schema.serviceMethod)
    .where(eq(schema.serviceMethod.serviceId, id));

  return {
    methods: methods.map((method) => adaptMethod({ method, service })),
    service: {
      id: service.id,
      name: service.name,
      title: service.title,
    },
  };
};

export const getMethodById = async ({
  methodId,
  serviceId,
}: {
  methodId: typeof schema.serviceMethod.$inferSelect.id;
  serviceId: typeof schema.service.$inferSelect.id;
}) => {
  const service = await db.query.service.findFirst({
    where: eq(schema.service.id, serviceId),
  });

  if (!service) {
    return;
  }

  const method = await db.query.serviceMethod.findFirst({
    where: eq(schema.serviceMethod.id, methodId),
  });

  if (!method) {
    return;
  }

  return {
    service: {
      id: service.id,
      name: service.name,
      title: service.title,
    },
    method: adaptMethod({ service, method }),
  };
};
