import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const bin = sqliteTable("bin", {
  name: text("name").primaryKey(),
  initialized: integer("initialized", { mode: "boolean" }),

  createdAt: integer("created_at", { mode: "number" })
    .default(sql`(unixepoch())`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "number" })
    .notNull()
    .default(sql`(unixepoch())`)
    .$onUpdate(() => sql`(unixepoch())`),
});

export const service = sqliteTable("service", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  baseUrl: text("base_url").notNull(),
  active: integer("active", { mode: "boolean" }).notNull(),
  methods: text("methods", { mode: "json" }).notNull(),

  createdAt: integer("created_at", { mode: "number" })
    .default(sql`(unixepoch())`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "number" })
    .notNull()
    .default(sql`(unixepoch())`)
    .$onUpdate(() => sql`(unixepoch())`),
});

export const serviceData = sqliteTable("service_data", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  serviceId: integer("service_id")
    .references(() => service.id)
    .notNull(),

  method: text("method").notNull(),
  data: text("data", { mode: "json" }).notNull(),

  createdAt: integer("created_at", { mode: "number" })
    .default(sql`(unixepoch())`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "number" })
    .notNull()
    .default(sql`(unixepoch())`)
    .$onUpdate(() => sql`(unixepoch())`),
});

export const cookie = sqliteTable("cookie", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
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

  createdAt: integer("created_at", { mode: "number" })
    .default(sql`(unixepoch())`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "number" })
    .notNull()
    .default(sql`(unixepoch())`)
    .$onUpdate(() => sql`(unixepoch())`),
});
