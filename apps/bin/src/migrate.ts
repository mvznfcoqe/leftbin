import "dotenv/config";
import { db, sqlite } from "./main";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";

migrate(db, { migrationsFolder: "./drizzle" });

sqlite.close();
