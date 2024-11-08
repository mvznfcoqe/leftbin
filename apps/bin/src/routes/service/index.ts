import { zValidator } from "@hono/zod-validator";
import { bearerAuth } from "hono/bearer-auth";
import { Hono } from "hono";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db, schema } from "../../schema";
import { parserQueue, parserWorkerName } from "@/workers/parser";
import { env } from "@/env";
import { getMethodFnByName } from "@/models/service";
import { getActiveMethods } from "@/models/services";

const service = new Hono();
service.use("/*", bearerAuth({ token: env.AUTH_TOKEN }));

const addCookiesDTO = z.object({
  cookies: z.array(
    z.object({
      name: z.string().min(1),
      value: z.string().min(1),
      domain: z.string().min(1),
      path: z.string().min(1),
      expires: z.coerce.number(),
      httpOnly: z.boolean(),
      secure: z.boolean(),
    })
  ),
});

service.post(
  "/:serviceId/cookies",
  zValidator("json", addCookiesDTO),
  async (ctx) => {
    const validated = ctx.req.valid("json");
    const serviceId = ctx.req.param("serviceId");

    const cookies = validated.cookies.map((cookie) => {
      return { ...cookie, serviceId: Number(serviceId) };
    });

    await db.insert(schema.cookie).values(cookies);

    return ctx.json({}, 201);
  }
);

service.delete("/:serviceId/cookies", async (ctx) => {
  const serviceId = ctx.req.param("serviceId");

  await db
    .delete(schema.cookie)
    .where(eq(schema.cookie.serviceId, Number(serviceId)));

  return ctx.json({}, 200);
});

service.get("/active-methods", async (ctx) => {
  const activeMethods = await getActiveMethods();

  return ctx.json(activeMethods);
});

const serviceMethodParamsDTO = z.record(z.string(), z.string());

service.get(
  "/:name/:method",
  zValidator("query", serviceMethodParamsDTO),
  async (ctx) => {
    const query = ctx.req.valid("query");

    const name = ctx.req.param("name");
    const method = ctx.req.param("method");

    const methodFn = await getMethodFnByName({
      serviceName: name,
      methodName: method,
    });

    if (!methodFn) {
      return ctx.json({}, { status: 404 });
    }

    await parserQueue.add(parserWorkerName, {
      methodName: method,
      query,
      serviceName: name,
    });

    return ctx.json({}, { status: 201 });
  }
);

export { service };
