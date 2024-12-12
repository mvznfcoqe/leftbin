import {
  getMethodFnByName,
  getMethodsById,
  getMethodById,
} from "@/models/service";
import { parserQueue, parserWorkerName } from "@/workers/parser";
import { eq } from "drizzle-orm";
import Elysia, { t } from "elysia";
import { db, schema, schemaTypebox } from "../../schema";

const { service, serviceMethod } = schemaTypebox.select;

const methodSchema = t.Object({
  id: serviceMethod.id,
  url: t.String(),
  name: serviceMethod.name,
  title: serviceMethod.title,
  isCookiesRequired: serviceMethod.isCookiesRequired,
  type: t.String(),
});

const serviceRoute = new Elysia({
  prefix: "/service",
})
  .post(
    "/cookies/:serviceId",
    async ({ params, body, set }) => {
      const cookies = body.cookies.map((cookie) => {
        return { ...cookie, serviceId: Number(params.serviceId) };
      });

      await db.insert(schema.cookie).values(cookies);

      set.status = 201;
      return {};
    },
    {
      body: t.Object({
        cookies: t.Array(
          t.Object({
            name: t.String({ minLength: 1 }),
            value: t.String({ minLength: 1 }),
            domain: t.String({ minLength: 1 }),
            path: t.String({ minLength: 1 }),
            expires: t.Number(),
            httpOnly: t.Boolean(),
            secure: t.Boolean(),
          })
        ),
      }),
      detail: {
        responses: {
          "200": {
            description: "Success",
          },
        },
      },
    }
  )
  .delete(
    "/cookies/:serviceId",
    async ({ params }) => {
      await db
        .delete(schema.cookie)
        .where(eq(schema.cookie.serviceId, Number(params.serviceId)));

      return {};
    },
    {
      detail: {
        responses: {
          "200": {
            description: "Success",
          },
        },
      },
    }
  )
  .get(
    "/:serviceId/methods",
    async ({ params, error }) => {
      const methods = await getMethodsById({ id: params.serviceId });

      if (!methods) {
        return error(404);
      }

      return methods;
    },
    {
      params: t.Object({
        serviceId: t.Number(),
      }),
      detail: {
        // @ts-ignore
        responses: {
          "200": {
            description: "Success",
            content: {
              "application/json": {
                schema: t.Object({
                  methods: t.Array(methodSchema),
                  service: t.Object({
                    id: service.id,
                    name: service.name,
                    title: service.title,
                  }),
                }),
              },
            },
          },
        },
      },
    }
  )
  .get(
    "/:serviceId/methods/:methodId",
    async ({ params, error }) => {
      const method = await getMethodById({ ...params });

      if (!method) {
        return error(404);
      }

      return method;
    },
    {
      params: t.Object({
        serviceId: t.Number(),
        methodId: t.Number(),
      }),
      detail: {
        // @ts-ignore 
        responses: {
          "200": {
            description: "Success",
            content: {
              "application/json": {
                schema: t.Object({
                  methods: methodSchema,
                  service: t.Object({
                    id: service.id,
                    name: service.name,
                    title: service.title,
                  }),
                }),
              },
            },
          },
        },
      },
    }
  )
  .post(
    "/:serviceName/:methodName",
    async ({ params, query, error, set }) => {
      const { methodName, serviceName } = params;

      const methodFn = await getMethodFnByName({
        serviceName,
        methodName,
      });

      if (!methodFn) {
        return error(404, {});
      }

      await parserQueue.add(parserWorkerName, {
        methodName,
        serviceName,
        query,
      });

      set.status = 201;
      return {};
    },
    {
      detail: {
        responses: {
          "200": {
            description: "Success",
          },
        },
      },
    }
  );

export { serviceRoute };
