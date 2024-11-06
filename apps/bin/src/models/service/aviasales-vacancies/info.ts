import type { Service } from "../lib";
import { getVacancies, getVacanciesMethodName } from "./get-vacancies";

const info: Service["info"] = {
  name: "aviasales-vacancies",
  title: "Вакансии Aviasales",
  baseUrl: "https://www.aviasales.ru/about/vacancies",
  methods: [
    {
      name: getVacanciesMethodName,
      title: "Вакансии",
      fields: [
        { title: "Название вакансии", name: "name" },
        { title: "Ссылка", name: "url" },
      ],
      recheckTime: 30000,
      fn: getVacancies,
    },
  ],
};

export { info };
