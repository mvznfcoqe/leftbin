import "dotenv/config";

import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { db, sqlite } from "./schema";

migrate(db, { migrationsFolder: "./drizzle" });

sqlite.close();
