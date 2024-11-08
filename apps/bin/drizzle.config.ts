import { env } from "@/env";
import "dotenv/config";
import type { Config } from "drizzle-kit";
export default {
  schema: "@/schema/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
} satisfies Config;
