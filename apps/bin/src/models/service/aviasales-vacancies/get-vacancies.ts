import {
  handleServiceMethodStarted,
  handleServiceMethodSucced,
  type ServiceMethodFn,
} from "../lib";
import { info } from "./info";

type Vacancy = {
  id: string;
  name: string;
  url: string;
};

type Params = {
  nameIncludes?: string;
};

const methodName = "get-vacancies";

const getVacancies: ServiceMethodFn<Params, Vacancy[]> = async ({
  page,
  params,
}) => {
  const { methodInfo } = await handleServiceMethodStarted({
    methodName,
    serviceName: info.name,
    page,
  });

  const { method, service, baseUrl } = methodInfo;

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
      break;
    }
    if (params && params.nameIncludes && !name.includes(params.nameIncludes)) {
      break;
    }

    const base = new URL(baseUrl).origin;

    const vacancyUrl = `${base}${url}`;
    const vacancyId = url.split("/").at(-1);

    vacancies.push({ id: vacancyId || name, name, url: vacancyUrl });
  }

  return await handleServiceMethodSucced({ page, service, method, data: vacancies });
};

export { getVacancies, methodName };
