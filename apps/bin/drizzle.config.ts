import "dotenv/config";
import type { Config } from "drizzle-kit";
export default {
  schema: "src/scrapper/schema.ts",
  out: "./drizzle",
  driver: "better-sqlite",
} satisfies Config;
