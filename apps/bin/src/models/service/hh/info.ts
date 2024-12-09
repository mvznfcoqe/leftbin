import type { Service } from "../lib";
import { serviceName } from "./config";
import {
  upResumeMethod,
  methodName as upResumeMethodName,
} from "./methods/up-resume";

const info: Service["info"] = {
  name: serviceName,
  title: "hh.ru",
  baseUrl: "https://hh.ru",
  methods: [
    {
      name: upResumeMethodName,
      title: "Поднятие резюме",
      fields: [{ title: "Название резюме", name: "title" }],
      fn: upResumeMethod,
      baseUrl: "/applicant/resumes",
      notifyAbout: 'all',
      parameters: [
        {
          name: "resumeName",
          title: "Название резюме",
          required: false,
          description: null,
        },
      ],
      recheckTime: 14400000,
    },
  ],
};

export { info, serviceName };
