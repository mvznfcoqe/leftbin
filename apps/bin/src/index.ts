import { Hono } from "hono";

import pino from "pino";

import { env } from "./env";
import { init } from "./init";
import { db, schema } from "./schema";
import { eq } from "drizzle-orm";
import { check } from "./routes/check";
import { service } from "./routes/service";

import { bearerAuth } from "hono/bearer-auth";

export const logger = pino({ level: "debug" });

if (!env.AUTH_TOKEN) {
  throw Error("Auth token wasn't specified");
}

const app = new Hono({}).basePath("/api");

app.use("/*", bearerAuth({ token: env.AUTH_TOKEN }));

app.route("/check", check);
app.route("/service", service);

try {
  const bin = await db
    .select()
    .from(schema.bin)
    .where(eq(schema.bin.name, env.NAME));

  if (!bin[0]) {
    await init({ bin: { name: env.NAME } });

    logger.info(`Bin initialized with name "${env.NAME}"`);
  }
} catch (e) {
  console.log(e);
}

logger.info(
  `
    Bin instance "${env.NAME}" started on http://localhost:${env.PORT}. 
    Link of your Bin for Telegram bot in local network: "http://127.0.0.1:${env.PORT}/api?token=${env.AUTH_TOKEN}".
    Replace 127.0.0.1:${env.PORT} with your domain name.
  `
);

export default {
  port: env.PORT,
  fetch: app.fetch,
};
