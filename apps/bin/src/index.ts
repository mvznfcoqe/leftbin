import { eq } from "drizzle-orm";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { Elysia } from "elysia";
import { env } from "./env";
import { init, startRepeatableJobs } from "./init";
import { logger } from "./logger";
import { checkRoute } from "./routes/check";
import { notificationsRoute } from "./routes/notifications";
import { serviceRoute } from "./routes/service";
import { servicesRoute } from "./routes/services";
import { db, schema } from "./schema";
import swagger from "@elysiajs/swagger";

if (!env.AUTH_TOKEN) {
  throw Error("Auth token wasn't specified");
}

new Elysia()
  .use(swagger({ provider: "swagger-ui" }))
  .use(checkRoute)
  .use(serviceRoute)
  .use(servicesRoute)
  .use(notificationsRoute)
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

  if (env.START_ALL_USER_METHODS) {
    await startRepeatableJobs();
  }
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
