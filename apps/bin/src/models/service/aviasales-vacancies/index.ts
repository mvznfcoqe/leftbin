import { init } from "./init";
import { info } from "./info";
import type { Service, ServiceMethodFn } from "../lib";

const aviasalesVacanciesService: Service = {
  init,
  info,
  methods: info.methods.reduce(
    (acc, method) => {
      acc[method.name] = method.fn;

      return acc;
    },
    {} as Record<string, ServiceMethodFn>,
  ),
};

export { aviasalesVacanciesService };
