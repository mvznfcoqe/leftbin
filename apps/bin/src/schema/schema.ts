import type { ServiceMethodData } from "@/models/service/lib";
import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

const bin = sqliteTable("bin", {
  name: text().primaryKey(),
  initialized: integer("initialized", { mode: "boolean" }),

  createdAt: integer("created_at", { mode: "timestamp_ms" }).default(
    sql`CURRENT_TIMESTAMP`
  ),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .default(sql`CURRENT_TIMESTAMP`)
    .$onUpdate(() => new Date()),
});

const user = sqliteTable("user", {
  id: integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
  telegramId: text().unique(),

  name: text("name").unique().notNull(),

  createdAt: integer("created_at", { mode: "timestamp_ms" }).default(
    sql`CURRENT_TIMESTAMP`
  ),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .default(sql`CURRENT_TIMESTAMP`)
    .$onUpdate(() => new Date()),
});

const service = sqliteTable("service", {
  id: integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  title: text("title").notNull(),
  baseUrl: text("base_url").notNull(),

  createdAt: integer("created_at", { mode: "timestamp_ms" }).default(
    sql`CURRENT_TIMESTAMP`
  ),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .default(sql`CURRENT_TIMESTAMP`)
    .$onUpdate(() => new Date()),
});

const serviceMethod = sqliteTable("service_method", {
  id: integer({ mode: "number" }).primaryKey({ autoIncrement: true }),

  serviceId: integer("service_id")
    .references(() => service.id)
    .notNull(),
  name: text("name").notNull(),
  title: text("title").notNull(),
  baseUrl: text("base_url"),
  isCookiesRequired: integer("is_cookies_required", { mode: "boolean" })
    .default(false)
    .notNull(),

  type: text({ enum: ["code"] })
    .notNull()
    .default("code"),

  createdAt: integer("created_at", { mode: "timestamp_ms" }).default(
    sql`CURRENT_TIMESTAMP`
  ),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .default(sql`CURRENT_TIMESTAMP`)
    .$onUpdate(() => new Date()),
});

const serviceMethodField = sqliteTable("service_method_field", {
  id: integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
  name: text("method").notNull().unique(),
  title: text("title").notNull(),
  serviceId: integer("service_id")
    .references(() => service.id)
    .notNull(),
  methodId: integer("method_id")
    .references(() => serviceMethod.id)
    .notNull(),

  createdAt: integer("created_at", { mode: "timestamp_ms" }).default(
    sql`CURRENT_TIMESTAMP`
  ),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .default(sql`CURRENT_TIMESTAMP`)
    .$onUpdate(() => new Date()),
});

const serviceMethodParameter = sqliteTable("service_method_parameter", {
  id: integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  title: text("title").notNull(),
  description: text("description"),

  serviceId: integer("service_id")
    .references(() => service.id)
    .notNull(),
  methodId: integer("method_id")
    .references(() => serviceMethod.id)
    .notNull(),

  createdAt: integer("created_at", { mode: "timestamp_ms" }).default(
    sql`CURRENT_TIMESTAMP`
  ),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .default(sql`CURRENT_TIMESTAMP`)
    .$onUpdate(() => new Date()),
});

export const defaultNotifyAbout: "all" | "new" = "new";

const userServiceMethod = sqliteTable("user_service_method", {
  id: integer({ mode: "number" }).primaryKey({ autoIncrement: true }),

  serviceId: integer("service_id")
    .references(() => service.id)
    .notNull(),
  methodId: integer("method_id")
    .references(() => serviceMethod.id)
    .notNull(),
  userId: integer("user_id")
    .references(() => user.id)
    .notNull(),

  notifyAbout: text("notify_about", { enum: ["all", "new"] }).default(
    defaultNotifyAbout
  ),
  recheckTime: integer("recheck_time"),
  randomizeRecheckTime: integer("randomize_recheck_time", {
    mode: "boolean",
  }).default(false),
  active: integer("active", { mode: "boolean" }).default(true),

  createdAt: integer("created_at", { mode: "timestamp_ms" }).default(
    sql`CURRENT_TIMESTAMP`
  ),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .default(sql`CURRENT_TIMESTAMP`)
    .$onUpdate(() => new Date()),
});

const serviceData = sqliteTable("service_data", {
  id: integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
  serviceId: integer("service_id")
    .references(() => service.id)
    .notNull(),
  methodId: integer("method_id")
    .references(() => serviceMethod.id)
    .notNull(),

  data: text("data", { mode: "json" }).$type<ServiceMethodData>().notNull(),

  createdAt: integer("created_at", { mode: "timestamp_ms" }).default(
    sql`CURRENT_TIMESTAMP`
  ),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .default(sql`CURRENT_TIMESTAMP`)
    .$onUpdate(() => new Date()),
});

const cookie = sqliteTable("cookie", {
  id: integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
  serviceId: integer("service_id")
    .references(() => service.id)
    .notNull(),

  name: text("name").notNull(),
  value: text("value").notNull(),
  domain: text("domain").notNull(),
  path: text("path").notNull(),
  expires: integer("expires").notNull(),
  httpOnly: integer("http_only", { mode: "boolean" }),
  secure: integer("secure", { mode: "boolean" }),

  createdAt: integer("created_at", { mode: "timestamp_ms" }).default(
    sql`CURRENT_TIMESTAMP`
  ),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .default(sql`CURRENT_TIMESTAMP`)
    .$onUpdate(() => new Date()),
});

export {
  bin,
  cookie,
  service,
  serviceData,
  serviceMethod,
  serviceMethodField,
  serviceMethodParameter,
  user,
  userServiceMethod,
};
