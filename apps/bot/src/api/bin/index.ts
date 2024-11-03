import { ofetch } from "ofetch";

type CheckResponse = {
  version: string;
};

const check = async ({
  baseUrl,
  token,
}: {
  baseUrl: string;
  token: string;
}) => {
  return await ofetch<CheckResponse>("/check", {
    baseURL: baseUrl,
    headers: { Authorization: `Bearer ${token}` },
  });
};

export { check };
