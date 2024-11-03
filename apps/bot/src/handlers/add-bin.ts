import { Composer } from "grammy";

import type { MyContext } from "../lib/grammy";
import { conversationNames } from "../config/conversations";

const addBinHandler = new Composer<MyContext>();

addBinHandler.command("addbin", async (ctx) => {
  await ctx.conversation.enter(conversationNames.addBin);
});

export { addBinHandler };
