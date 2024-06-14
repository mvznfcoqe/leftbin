import { booleanToBinary } from "@/scrapper/lib/boolean-to-binary";
import { varchar } from "drizzle-orm/mysql-core";
import { withQuery } from "ufo";

export const baseUrl = "https://www.avito.ru";

const sortMap = {
  date: 103,
  cheaper: 1,
  dearer: 2,
};

export const getSearchBaseUrl = ({
  query,
  delivery,
  region = "all",
  page,
  sort,
  vacancies,
}: {
  query: string;
  delivery: boolean;
  region?: string;
  page?: number;
  sort?: "date" | "cheaper" | "dearer";
  vacancies?: boolean;
}) => {
  let url = `${baseUrl}/${region}`;

  if (vacancies) {
    url += "/vakansii";
  }

  return withQuery(url, {
    d: booleanToBinary(delivery),
    q: query,
    page,
    sort: sort && sortMap[sort],
  });
};
