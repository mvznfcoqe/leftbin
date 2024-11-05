import type { Service } from "../lib";
import { getVacancies, getVacanciesMethodName } from "./get-vacancies";

const info: Service["info"] = {
  name: "aviasales-vacancies",
  baseUrl: "https://www.aviasales.ru/about/vacancies",
  active: true,
  methods: [
    {
      name: getVacanciesMethodName,
      fields: { name: "Название вакансии", url: "Ссылка" },
      recheckTime: 30000,
      fn: getVacancies,
    },
  ],
};

export { info };
