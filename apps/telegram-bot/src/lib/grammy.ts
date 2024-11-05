import type { I18nFlavor } from "@grammyjs/i18n";
import type { Context, SessionFlavor } from "grammy";
import type { SessionData } from "./session";
import type { Conversation, ConversationFlavor } from "@grammyjs/conversations";

type MyContext = Context &
  I18nFlavor &
  SessionFlavor<SessionData> &
  ConversationFlavor;

type MyConversation = Conversation<MyContext>;

export type { MyContext, MyConversation };
