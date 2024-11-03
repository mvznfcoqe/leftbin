import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: serial().primaryKey(),
  telegramId: text("telegram_id").unique(),

  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "string" })
    .notNull()
    .defaultNow()
    .$onUpdate(() => Date.now().toString()),
});

export const bin = pgTable("bin", {
  id: serial().primaryKey(),

  userId: integer("user_id").references(() => user.id),
  url: text().notNull(),
  token: text(),

  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "string" })
    .notNull()
    .defaultNow()
    .$onUpdate(() => Date.now().toString()),
});
