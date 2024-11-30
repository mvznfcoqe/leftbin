import { init } from "./init";
import { info } from "./info";
import { adaptServiceMethods, type Service } from "../lib";

const hhService: Service = {
  init,
  info,
  methods: adaptServiceMethods(info),
};

export { hhService };
