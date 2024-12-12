import type { LocationQueryValue } from "vue-router";

export const queryToString = (
  query: LocationQueryValue | LocationQueryValue[]
) => {
  if (Array.isArray(query) && query[0]) {
    return query[0];
  } else if (typeof query === "string" && query) {
    return query;
  }
};
