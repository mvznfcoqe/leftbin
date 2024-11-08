import "dotenv/config";
import type { Config } from "drizzle-kit";
import { env } from "./src/env";
export default {
  schema: "@/schema/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
} satisfies Config;
