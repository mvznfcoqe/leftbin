import { Composer } from "grammy";
import type { MyContext } from "../lib/grammy";
import { createConversation } from "@grammyjs/conversations";
import { addBin } from "./add-bin";
import { conversationNames } from "../config/conversations";

const conversationHandlers = new Composer<MyContext>();

conversationHandlers.use(
  createConversation(addBin, { id: conversationNames.addBin })
);

export { conversationHandlers };
