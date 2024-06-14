import { sql } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const avitoBin = sqliteTable("avitoBin", {
  url: text("url").unique().notNull(),
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  title: text("text").notNull(),
  price: integer("price", { mode: "number" }),
  request: text("request").notNull(),
  created_at: integer("created_at")
    .default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`)
    .notNull(),
});
