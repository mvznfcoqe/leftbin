import { env } from "@/env";
import { Bot } from "grammy";

const bot = new Bot(env.BOT_TOKEN);

export { bot };
