import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

export const db = drizzle({
  connection: {
    connectionString: "postgresql://postgres:frkamQwE2@localhost:5432/postgres",
  },
  schema,
});
