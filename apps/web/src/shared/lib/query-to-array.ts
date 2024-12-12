import type { LocationQueryValue } from "vue-router";

export const queryToArray = (
  query: LocationQueryValue | LocationQueryValue[]
) => {
  if (!Array.isArray(query) && query) {
    return [query] as string[];
  } else if (Array.isArray(query)) {
    return query as string[];
  }

  return [];
};
