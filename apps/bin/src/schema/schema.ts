import {
  integer,
  pgTable,
  text,
  boolean,
  json,
  timestamp,
  serial,
  bigint,
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
  baseUrl: text("base_url").notNull(),
  active: boolean("active").notNull(),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

const serviceMethod = pgTable("service_method", {
  id: serial().primaryKey(),

  active: boolean("active").notNull(),

  serviceId: integer("service_id")
    .references(() => service.id)
    .notNull(),
  name: text("method").notNull(),
  recheckTime: integer("recheck_time"),

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

  method: text("method").notNull(),
  data: json("data").notNull(),

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
  serviceMethodField,
  serviceData,
  cookie,
};
