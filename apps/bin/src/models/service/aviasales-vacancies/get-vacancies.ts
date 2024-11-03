import playwright from "playwright";
import { db, schema } from "@/schema";
import { eq } from "drizzle-orm";
import { info } from "./info";

type AviasalesVacancy = {
  name: string | null;
  url: string | null;
};

type GetVacanciesParams = {
  nameIncludes?: string;
  omitOld?: boolean;
};

const getVacancies = async (
  context: playwright.BrowserContext,
  params: GetVacanciesParams = {}
) => {
  const services = await db
    .select()
    .from(schema.service)
    .where(eq(schema.service.name, info.name));

  const service = services[0];

  if (!service || !service.active) return;

  const vacancies: AviasalesVacancy[] = [];

  const page = await context.newPage();
  await page.goto(service.baseUrl);
  await page.waitForTimeout(1000);

  const vacanciesContainer = page.locator(".vacancies");

  await page.waitForSelector(".vacancies_vacancy");
  const locators = await vacanciesContainer.locator(".vacancies_vacancy").all();

  for (const index in locators) {
    const name = await locators[index]
      .locator(".vacancies_vacancy__name")
      .textContent();
    const url = await locators[index].getAttribute("href");

    if (!name || !url) break;
    if (params.nameIncludes && !name.includes(params.nameIncludes)) break;

    const base = new URL(service.baseUrl).origin;

    vacancies.push({ name, url: `${base}${url}` });
  }

  await db.insert(schema.serviceData).values({
    data: vacancies,
    serviceId: service.id,
    method: info.methods.getVacancies,
  });

  if (!params.omitOld) {
    const serviceData = await db
      .select()
      .from(schema.serviceData)
      .where(eq(schema.serviceData.serviceId, service.id));
    const previousServiceData = serviceData.at(1);

    if (!previousServiceData) return { data: vacancies };

    const previousServiceDataList =
      previousServiceData.data as AviasalesVacancy[];

    const newDataFields = previousServiceDataList.reduce((acc, vacancy) => {
      if (previousServiceDataList.some(({ name }) => name === vacancy.name))
        return acc;

      acc.push(vacancy);

      return acc;
    }, [] as AviasalesVacancy[]);

    return { data: newDataFields };
  }

  return { data: vacancies };
};

export { getVacancies };
