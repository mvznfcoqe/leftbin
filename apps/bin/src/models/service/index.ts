import { aviasalesVacanciesService } from "./aviasales-vacancies";
import { hhService } from "./hh";
import type { Service, ServiceResponse } from "./lib";

export const services: Service[] = [aviasalesVacanciesService, hhService];

export type { Service, ServiceResponse };
export {
  getMethodNewData,
  getMethodRecheckTime,
  getMethodFnByName,
  getMethodPreviousDataByLastId,
} from "./lib";
export { getMethodsById, getMethodById } from "./get-methods";
