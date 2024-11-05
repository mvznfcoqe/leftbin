import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

const bin = sqliteTable("bin", {
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

const service = sqliteTable("service", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  baseUrl: text("base_url").notNull(),
  active: integer("active", { mode: "boolean" }).notNull(),

  createdAt: integer("created_at", { mode: "number" })
    .default(sql`(unixepoch())`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "number" })
    .notNull()
    .default(sql`(unixepoch())`)
    .$onUpdate(() => sql`(unixepoch())`),
});

const serviceMethod = sqliteTable("service_method", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),

  active: integer("active", { mode: "boolean" }).notNull(),

  serviceId: integer("service_id")
    .references(() => service.id)
    .notNull(),
  name: text("method").notNull(),
  recheckTime: integer("recheck_time", { mode: "number" }),

  createdAt: integer("created_at", { mode: "number" })
    .default(sql`(unixepoch())`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "number" })
    .notNull()
    .default(sql`(unixepoch())`)
    .$onUpdate(() => sql`(unixepoch())`),
});

const serviceMethodField = sqliteTable("service_method_field", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  name: text("method").notNull(),
  title: text("title").notNull(),
  serviceId: integer("service_id")
    .references(() => service.id)
    .notNull(),
  methodId: integer("method_id")
    .references(() => serviceMethod.id)
    .notNull(),

  createdAt: integer("created_at", { mode: "number" })
    .default(sql`(unixepoch())`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "number" })
    .notNull()
    .default(sql`(unixepoch())`)
    .$onUpdate(() => sql`(unixepoch())`),
});

const serviceData = sqliteTable("service_data", {
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

const cookie = sqliteTable("cookie", {
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

export { bin, service, serviceMethod, serviceMethodField, serviceData, cookie };
