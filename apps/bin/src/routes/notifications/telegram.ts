import { getCurrentUser } from "@/models/user";
import { db, schema } from "@/schema";
import { eq } from "drizzle-orm";
import Elysia, { t } from "elysia";

const telegram = new Elysia({ prefix: "/telegram", }).post(
  "/setup",
  async ({ body, error, set }) => {
    const user = await getCurrentUser();

    if (!user) {
      return error(403, {});
    }

    await db
      .update(schema.user)
      .set({ telegramId: body.telegramId.toString() })
      .where(eq(schema.user.name, user?.name))
      .returning();

    set.status = 201;
    return {};
  },
  {
    body: t.Object({
      telegramId: t.Number({ minimum: 1 }),
    }),
  }
);

export { telegram };
