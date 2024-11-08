import { FetchError } from "ofetch";
import { binConfig } from "../config/bin";
import type { MyContext, MyConversation } from "../lib/grammy";
import { db, schema } from "../schema";
import { getUserByContext } from "../user";
import { api } from "../api";
import { eq } from "drizzle-orm";

const checkBinStatus = async ({
  url,
  token,
  ctx,
}: {
  url: string;
  token: string;
  ctx: MyContext;
}) => {
  await ctx.reply(ctx.t("trying-access-to-bin"));

  try {
    const response = await api.bin.check({ baseUrl: url, token });

    if (!response.ok) {
      ctx.reply(ctx.t("bin-check-status-failed"));

      return false;
    }

    if (response.ok) {
      await ctx.reply(ctx.t("bin-status-active"));

      return true;
    }
  } catch (e) {
    console.log(e);
    if (e instanceof FetchError) {
      if (e.status === 401) {
        ctx.reply(ctx.t("bin-auth-failed"));
      } else {
        ctx.reply(ctx.t("bin-check-status-failed"));
      }
    }

    return false;
  }
};

const getBinDataFromUrl = async ({
  url,
}: {
  url: URL;
  ctx: MyContext;
}): Promise<{ token: string; url: string } | undefined> => {
  const token = url.searchParams.get(binConfig.authTokenKey);

  if (!token) {
    return;
  }

  const binUrlWithoutQuery = url.href.split("?")[0];

  return { token, url: binUrlWithoutQuery };
};

const addBin = async (conversation: MyConversation, ctx: MyContext) => {
  await ctx.reply(ctx.t("request-bin-data"));
  const url = await conversation.form.url(async () => {
    await ctx.reply(ctx.t("bin-url-invalid"));
  });

  const binData = await getBinDataFromUrl({ url, ctx });

  if (!binData) {
    await ctx.reply(ctx.t("bin-data-invalid"));

    return;
  }

  conversation.external(async () => {
    const user = await getUserByContext({ ctx });

    if (!user) {
      return;
    }

    const bin = await db.query.bin.findFirst({
      where: eq(schema.bin.url, binData.url),
    });

    if (bin) {
      await ctx.reply(ctx.t("bin-already-added"));

      return;
    }

    const isBinActive = await checkBinStatus({
      ctx,
      url: binData.url,
      token: binData.token,
    });

    if (!isBinActive) {
      return;
    }

    if (!ctx.from?.id) {
      return;
    }

    await api.bin.setup({
      baseUrl: binData.url,
      token: binData.token,
      telegramId: ctx.from.id,
    });

    await db.insert(schema.bin).values({
      userId: user.id,
      url: binData.url,
      token: binData.token,
    });

    ctx.reply(ctx.t("bin-successfully-added"));
  });
};

export { addBin };
