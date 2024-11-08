import { env } from "@/env";
import { Bot } from "grammy";

console.log(env);
const bot = new Bot(env.BOT_TOKEN);

export { bot };
