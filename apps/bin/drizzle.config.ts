import "dotenv/config";
import type { Config } from "drizzle-kit";
export default {
  schema: "src/schema/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
} satisfies Config;
