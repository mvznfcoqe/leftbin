import { createServiceMethodFn, ServiceMethodAction } from "../../lib";
import { serviceName } from "../info";

type Vacancy = {
  id: string;
  name: string;
  url: string;
};

type Params = {
  nameIncludes?: string;
};

const methodName = "get-vacancies";

const getVacanciesAction: ServiceMethodAction<Params> = async ({
  page,
  params,
  service,
}) => {
  const baseUrl = service.baseUrl;

  const vacancies: Vacancy[] = [];

  const vacanciesContainer = await page.$(".vacancies");
  if (!vacanciesContainer) {
    throw new Error("Failed to find vacanciesContainer");
  }

  await page.waitForSelector(".vacancies_vacancy");
  const locators = await vacanciesContainer.$$(".vacancies_vacancy");

  for (const index in locators) {
    const name = await locators[index].$eval(
      ".vacancies_vacancy__name",
      ({ textContent }) => {
        return textContent;
      }
    );
    const url = await locators[index].evaluate((element) => {
      return element.getAttribute("href");
    });

    const isDataInvalid = !name || !url;
    if (isDataInvalid) {
      continue;
    }
    if (params && params.nameIncludes && !name.includes(params.nameIncludes)) {
      continue;
    }

    const base = new URL(baseUrl).origin;

    const vacancyUrl = `${base}${url}`;
    const vacancyId = url.split("/").at(-1);

    vacancies.push({ id: vacancyId || name, name, url: vacancyUrl });
  }

  return {
    data: vacancies,
    message: "Вакансии успешно получены",
    status: "success",
  };
};

const getVacanciesMethod = createServiceMethodFn({
  methodName,
  serviceName,
  fn: getVacanciesAction,
});

export { getVacanciesMethod, methodName };
