import { db, schema } from "@/schema";
import { eq } from "drizzle-orm";

export const getCurrentUser = async () => {
  return await db.query.user.findFirst({
    where: eq(schema.user.name, "admin"),
  });
};
