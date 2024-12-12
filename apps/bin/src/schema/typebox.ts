import { spreads } from "./lib";
import { schema } from "./schema";

export const schemaTypebox = {
  insert: spreads(
    {
      ...schema,
    },
    "insert"
  ),
  select: spreads(
    {
      ...schema,
    },
    "select"
  ),
};
