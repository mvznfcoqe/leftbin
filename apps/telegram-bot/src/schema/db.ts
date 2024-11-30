import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import { env } from "@/env";

export const db = drizzle({ connection: { source: env.DATABASE_URL }, schema });
