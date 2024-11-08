import { ofetch } from "ofetch";

type BaseBinParams = {
  baseUrl: string;
  token: string;
};

const getBinBaseHeaders = ({ token }: Pick<BaseBinParams, "token">) => {
  return { Authorization: `Bearer ${token}` };
};

type CheckResponse = {
  ok: boolean;
};

const check = async ({ baseUrl, token }: BaseBinParams) => {
  return await ofetch<CheckResponse>("/check", {
    baseURL: baseUrl,
    headers: getBinBaseHeaders({ token }),
  });
};

const setup = async ({
  baseUrl,
  telegramId,
  token,
}: { telegramId: number } & BaseBinParams) => {
  return await ofetch<CheckResponse>("/notifications/telegram/setup", {
    baseURL: baseUrl,
    headers: getBinBaseHeaders({ token }),
    method: "POST",
    body: { telegramId },
  });
};

export { check, setup };
