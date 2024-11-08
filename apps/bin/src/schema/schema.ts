import type { ServiceMethodData } from "@/models/service/lib";
import {
  integer,
  pgTable,
  text,
  boolean,
  json,
  timestamp,
  serial,
} from "drizzle-orm/pg-core";

const bin = pgTable("bin", {
  name: text().primaryKey(),
  initialized: boolean("initialized"),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

const user = pgTable("user", {
  id: serial().primaryKey(),
  telegramId: text().unique(),

  name: text("name").unique().notNull(),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

const service = pgTable("service", {
  id: serial().primaryKey(),
  name: text("name").notNull().unique(),
  title: text("title").notNull(),
  baseUrl: text("base_url").notNull(),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

const serviceMethod = pgTable("service_method", {
  id: serial().primaryKey(),

  serviceId: integer("service_id")
    .references(() => service.id)
    .notNull(),
  name: text("name").notNull(),
  title: text("title").notNull(),

  type: text({ enum: ["code"] })
    .notNull()
    .default("code"),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

const defaultNotifyAbout: "all" | "new" = "new";

const userServiceMethod = pgTable("user_service_method", {
  id: serial().primaryKey(),

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
    defaultNotifyAbout,
  ),
  recheckTime: integer("recheck_time"),
  active: boolean("active").default(true),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

const serviceMethodField = pgTable("service_method_field", {
  id: serial().primaryKey(),
  name: text("method").notNull(),
  title: text("title").notNull(),
  serviceId: integer("service_id")
    .references(() => service.id)
    .notNull(),
  methodId: integer("method_id")
    .references(() => serviceMethod.id)
    .notNull(),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

const serviceData = pgTable("service_data", {
  id: serial().primaryKey(),
  serviceId: integer("service_id")
    .references(() => service.id)
    .notNull(),
  methodId: integer("method_id")
    .references(() => serviceMethod.id)
    .notNull(),

  data: json("data").$type<ServiceMethodData>().notNull(),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

const cookie = pgTable("cookie", {
  id: serial().primaryKey(),
  serviceId: integer("service_id")
    .references(() => service.id)
    .notNull(),

  name: text("name").notNull(),
  value: text("value").notNull(),
  domain: text("domain").notNull(),
  path: text("path").notNull(),
  expires: integer("expires").notNull(),
  httpOnly: boolean("http_only"),
  secure: boolean("secure"),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export {
  bin,
  user,
  service,
  serviceMethod,
  userServiceMethod,
  serviceMethodField,
  serviceData,
  cookie,
};
