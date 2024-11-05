import { Composer } from "grammy";
import type { Chat } from "grammy/types";
import { db, schema } from "../schema";
import type { MyContext } from "../lib/grammy";
import { conversationNames } from "../config/conversations";
import { getUserByContext } from "../user";

const connectHandler = new Composer<MyContext>();

connectHandler
  .filter(
    (
      ctx
    ): ctx is MyContext & {
      chat: Chat.PrivateChat;
      from: object;
    } => ctx.chat?.type === "private"
  )
  .command("start", async (ctx) => {
    const user = await getUserByContext({ ctx });

    if (!user) {
      const telegramId = ctx.from.id.toString();

      await db
        .insert(schema.user)
        .values({ telegramId: telegramId })
        .onConflictDoNothing();
    }

    await ctx.conversation.enter(conversationNames.addBin);
  });

export { connectHandler };
