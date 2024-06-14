import * as schema from "./scrapper/schema";
import { drizzle } from "drizzle-orm/bun-sqlite";
import Database from "bun:sqlite";
import pino from "pino";
import { Hono } from "hono";
import { cors } from "hono/cors";

import { version } from "../package.json";

export const logger = pino({});

const app = new Hono({});

app.use(
  "/api/*",
  cors({
    allowMethods: ["GET", "POST", "DELETE", "UPDATE", "OPTIONS"],
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.get("/api/check", (ctx) => {
  return ctx.json({
    status: "OK",
    version: version,
  });
});

export const sqlite = new Database("sqlite.db");
export const db = drizzle(sqlite, { schema });

const port = 6173;

console.log(`App started on http://localhost:${port}`);
export default {
  port: port,
  fetch: app.fetch,
};

// try {
//   const { cookies, geolocation } = await import("./config").catch(() => {
//     throw new ImportError("");
//   });

//   await avito.parseByName("Мастер шугаринга", {
//     cookies,
//     geolocation,
//     pages: 10,
//     location: "voronezh",
//     vacancies: true,
//   });
// } catch (error) {
//   if (error instanceof ImportError) {
//     logger.error("Configuration file has not been provided");
//   }

//   logger.error("Failed to start app");
// }
