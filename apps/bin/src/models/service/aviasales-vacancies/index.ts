import { init } from "./init";
import { info } from "./info";
import { adaptServiceMethods, type Service } from "../lib";

const aviasalesVacanciesService: Service = {
  init,
  info,
  methods: adaptServiceMethods(info),
};

export { aviasalesVacanciesService };
