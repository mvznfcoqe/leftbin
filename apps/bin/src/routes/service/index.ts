import { getMethodFnByName } from "@/models/service";
import { parserQueue, parserWorkerName } from "@/workers/parser";
import { eq } from "drizzle-orm";
import Elysia, { t } from "elysia";
import { db, schema } from "../../schema";

const service = new Elysia({ prefix: "/service", name: 'service', tags: ["service"] })
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
    }
  )
  .delete("/cookies/:serviceId", async ({ params }) => {
    await db
      .delete(schema.cookie)
      .where(eq(schema.cookie.serviceId, Number(params.serviceId)));

    return {};
  })
  .post("/:name/:method", async ({ params, query, error, set }) => {
    const { method, name } = params;

    const methodFn = await getMethodFnByName({
      serviceName: name,
      methodName: method,
    });

    if (!methodFn) {
      return error(404, {});
    }

    await parserQueue.add(parserWorkerName, {
      methodName: method,
      serviceName: name,
      query,
    });

    set.status = 201;
    return {};
  });

export { service };
