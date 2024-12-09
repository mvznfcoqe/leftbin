import type { Service } from "../lib";
import { serviceName } from "./config";
import {
  getVacanciesMethod,
  methodName as getVacanciesMethodName,
} from "./methods/get-vacancies";

const info: Service["info"] = {
  name: serviceName,
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
      recheckTime: 43200000,
      fn: getVacanciesMethod,
      parameters: [{ name: "", title: "", required: false, description: null }],
    },
  ],
};

export { info, serviceName };
