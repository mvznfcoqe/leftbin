import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const user = sqliteTable("user", {
  id: integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
  telegramId: text("telegram_id").unique(),

  createdAt: integer("created_at", { mode: "timestamp_ms" }).default(
    sql`CURRENT_TIMESTAMP`
  ),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .default(sql`CURRENT_TIMESTAMP`)
    .$onUpdate(() => new Date()),
});

export const bin = sqliteTable("bin", {
  id: integer({ mode: "number" }).primaryKey({ autoIncrement: true }),

  userId: integer("user_id").references(() => user.id),
  url: text().notNull(),
  token: text(),

  createdAt: integer("created_at", { mode: "timestamp_ms" }).default(
    sql`CURRENT_TIMESTAMP`
  ),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .default(sql`CURRENT_TIMESTAMP`)
    .$onUpdate(() => new Date()),
});
