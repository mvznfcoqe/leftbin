import { Bot, session } from "grammy";

import { env } from "./env";
import { handlers } from "./handlers";
import type { MyContext } from "./lib/grammy";
import { I18n } from "@grammyjs/i18n";
import { getInitialSession } from "./lib/session";
import { conversations } from "@grammyjs/conversations";
import { conversationHandlers } from "./conversations";
import { db } from "./schema";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pino from "pino";

export const logger = pino({ level: "debug" });

if (env.MIGRATE) {
  logger.info("Database migration started");
  void (await migrate(db, { migrationsFolder: "./drizzle" }));
}

const bot = new Bot<MyContext>(env.BOT_TOKEN);

const i18n = new I18n<MyContext>({
  defaultLocale: "en",
  directory: "src/config/locales",
});

bot.use(i18n);
bot.use(
  session({
    initial: () => {
      return getInitialSession();
    },
  })
);
bot.use(conversations<MyContext>());

bot.use(conversationHandlers);
bot.use(handlers);

bot.start();

bot.catch((err) => {
  logger.error(`Error while handling update ${err.ctx.update.update_id}:`);
  logger.error(err.error);
});

logger.info("Bot started");
