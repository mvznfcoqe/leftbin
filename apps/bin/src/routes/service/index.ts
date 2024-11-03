import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { db, schema } from "../../schema";
import { eq } from "drizzle-orm";
import { getActiveServices } from "../../models/services";
import { services } from "@/models/service";
import { firefox } from "playwright";

export const service = new Hono();

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

  return ctx.json({});
});

service.get("/active-services", async (ctx) => {
  const activeServices = await getActiveServices();

  return ctx.json(activeServices);
});

const serviceMethodParamsDTO = z.record(z.string(), z.string());

service.get(
  "/:name/:method",
  zValidator("query", serviceMethodParamsDTO),
  async (ctx) => {
    const query = ctx.req.valid("query");

    const name = ctx.req.param("name");
    const method = ctx.req.param("method");

    const service = services[name];

    if (!service) {
      return ctx.json({}, { status: 404 });
    }

    const methodFn = service[method];

    if (!methodFn) {
      return ctx.json({}, { status: 404 });
    }

    const browser = await firefox.launch();
    const context = await browser.newContext();

    const data = await methodFn(context, query);

    return ctx.json(data);
  }
);

service.get(
  "/all",
  zValidator("query", serviceMethodParamsDTO),
  async (ctx) => {
    const query = ctx.req.valid("query");

    const data = Object.entries(services).reduce(
      async (acc, [serviceName, value]) => {
        const browser = await firefox.launch();
        const context = await browser.newContext();

        for (const [methodName, method] of Object.entries(value)) {
          const data = await method(context, query);

          acc[serviceName][methodName] = data;
        }

        return acc;
      },
      {} as Record<string, any>
    );

    return ctx.json(data);
  }
);
