import type { Service } from "../lib";
import { upResume, methodName as upResumeMethodName } from "./up-resume";

const info: Service["info"] = {
  name: "hh",
  title: "hh.ru",
  baseUrl: "https://hh.ru",
  methods: [
    {
      name: upResumeMethodName,
      title: "Поднятие резюме",
      fields: [],
      fn: upResume,
      baseUrl: "/applicant/resumes",
      parameters: [{ name: 'resumeName', title: "Название резюме", required: false }],
      recheckTime: 21600000
    },
  ],
};

export { info };
