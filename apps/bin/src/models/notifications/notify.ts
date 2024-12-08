import { env } from "@/env";
import { logger } from "@/logger";
import { getCurrentUser } from "@/models/user";
import { Bot } from "grammy";

const bot = new Bot(env.BOT_TOKEN);

const notify = async ({ message }: { message: string }) => {
  const user = await getCurrentUser();

  if (!user) {
    return;
  }

  if (!user.telegramId) {
    logger.info(`Telegram ID was not specified for ${user.name}`);

    return;
  }

  await bot.api.sendMessage(user.telegramId, message);

  return;
};

export { notify };
