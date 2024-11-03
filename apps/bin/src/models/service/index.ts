import { aviasalesVacanciesService } from "./aviasales-vacancies";

export const services = {
  [aviasalesVacanciesService.info.name]: {
    [aviasalesVacanciesService.info.methods.getVacancies]:
      aviasalesVacanciesService.getVacancies,
  },
};
