import { eq } from "drizzle-orm";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { Elysia } from "elysia";
import { env } from "./env";
import { init, startRepeatableJobs } from "./init";
import { logger } from "./logger";
import { check } from "./routes/check";
import { notifications } from "./routes/notifications";
import { service } from "./routes/service";
import { db, schema } from "./schema";
import swagger from "@elysiajs/swagger";

if (!env.AUTH_TOKEN) {
  throw Error("Auth token wasn't specified");
}

new Elysia({ prefix: "/api" })
  .use(swagger())
  .use(check)
  .use(service)
  .use(notifications)
  .listen(env.PORT);

if (env.MIGRATE) {
  logger.info("Database migration started");
  void migrate(db, { migrationsFolder: "./drizzle" });
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
  `
);
