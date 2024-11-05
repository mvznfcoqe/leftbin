import { init } from "./init";
import { info } from "./info";
import type { Service } from "../lib";
import type { ServiceMethodFn } from "@/models/lib/types";

const aviasalesVacanciesService: Service = {
  init,
  info,
  methods: info.methods.reduce((acc, method) => {
    acc[method.name] = method.fn;

    return acc;
  }, {} as Record<string, ServiceMethodFn>),
};

export { aviasalesVacanciesService };
