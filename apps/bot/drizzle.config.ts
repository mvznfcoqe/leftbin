import "dotenv/config";
import type { Config } from "drizzle-kit";
export default {
  schema: "src/schema/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: "postgresql://postgres:frkamQwE2@localhost:5432/postgres",
  },
} satisfies Config;
