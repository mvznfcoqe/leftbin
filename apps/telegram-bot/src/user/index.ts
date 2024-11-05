import { eq } from "drizzle-orm";
import type { MyContext } from "../lib/grammy";
import { db, schema } from "../schema";

const getUserByContext = async ({ ctx }: { ctx: MyContext }) => {
  if (!ctx.from) return;

  const telegramId = ctx.from.id.toString();

  try {
    const user = await db.query.user.findFirst({
      where: eq(schema.user.telegramId, telegramId),
    });

    return user;
  } catch {}
};

export { getUserByContext };
