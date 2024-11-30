import { db, schema } from "@/schema";
import { info } from "./info";
import { getMethodInfo, type ServiceMethodFn } from "../lib";
import { gotoTimeout } from "../config";

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
  context,
  params,
}) => {
  const methodInfo = await getMethodInfo({
    methodName,
    serviceName: info.name,
  });

  if (!methodInfo) {
    throw new Error("Failed to get method info");
  }

  const { method, service, baseUrl } = methodInfo;

  const vacancies: Vacancy[] = [];

  const page = await context.newPage();
  await page.goto(baseUrl, { timeout: gotoTimeout });
  await page.waitForTimeout(1000);

  const vacanciesContainer = page.locator(".vacancies");

  await page.waitForSelector(".vacancies_vacancy");
  const locators = await vacanciesContainer.locator(".vacancies_vacancy").all();

  for (const index in locators) {
    const name = await locators[index]
      .locator(".vacancies_vacancy__name")
      .textContent();
    const url = await locators[index].getAttribute("href");

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

  const inserted = await db
    .insert(schema.serviceData)
    .values({
      data: vacancies,
      serviceId: service.id,
      methodId: method.id,
    })
    .returning();

  const insertedVacancies = inserted[0];

  return { data: vacancies, insertedId: insertedVacancies.id };
};

export { getVacancies, methodName };
