import { aviasalesVacanciesService } from "./aviasales-vacancies";
import type { Service, ServiceResponse } from "./lib";

export const services: Service[] = [aviasalesVacanciesService];

export type { Service, ServiceResponse };
export {
  getMethodNewData,
  getMethodRecheckTime,
  getMethodFnByName,
  getMethodPreviousDataByLastId,
} from "./lib";
