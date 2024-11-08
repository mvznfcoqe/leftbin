import { Hono } from "hono";

import pino from "pino";

import { env } from "./env";
import { init, startRepeatableJobs } from "./init";
import { db, schema } from "./schema";
import { eq } from "drizzle-orm";
import { check } from "./routes/check";
import { service } from "./routes/service";

import { notifications } from "./routes/notifications";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { serve } from "@hono/node-server";

export const logger = pino({ level: "debug" });

if (!env.AUTH_TOKEN) {
  throw Error("Auth token wasn't specified");
}

const app = new Hono({}).basePath("/api");

app.route("/", check);
app.route("/check", check);
app.route("/service", service);
app.route("/notifications", notifications);

if (env.MIGRATE) {
  logger.info("Database migration started");
  void (await migrate(db, { migrationsFolder: "./drizzle" }));
}

try {
  const bin = await db
    .select()
    .from(schema.bin)
    .where(eq(schema.bin.name, env.NAME));

  if (!bin[0]) {
    await init({ bin: { name: env.NAME } });

    logger.info(`Bin initialized with name "${env.NAME}"`);
  }

  await startRepeatableJobs();
} catch (e) {
  logger.error(e);
}

logger.info(
  `
    Bin instance "${env.NAME}" started on http://localhost:${env.PORT}. 
    Link of your Bin for Telegram bot in local network: "http://127.0.0.1:${env.PORT}/api?token=${env.AUTH_TOKEN}".
    Replace 127.0.0.1:${env.PORT} with your domain name.
  `,
);

serve({ port: env.PORT, hostname: env.HOSTNAME, fetch: app.fetch });
