import { db, schema } from "@/schema";
import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";

const telegram = new Hono();

const setupTelegramDTO = z.object({
  telegramId: z.number().min(1),
});

telegram.post("/setup", zValidator("json", setupTelegramDTO), async (ctx) => {
  const { telegramId } = ctx.req.valid("json");

  await db
    .update(schema.user)
    .set({ telegramId: telegramId.toString() })
    .where(eq(schema.user.name, "admin"))
    .returning();

  return ctx.json({}, 201);
});

export { telegram };
