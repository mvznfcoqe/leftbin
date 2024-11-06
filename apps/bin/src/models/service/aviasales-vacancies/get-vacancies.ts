import { db, schema } from "@/schema";
import { eq } from "drizzle-orm";
import { info } from "./info";
import type { ServiceMethodFn } from "@/models/lib/types";

type Vacancy = {
  name: string | null;
  url: string | null;
};

type Params = {
  nameIncludes?: string;
};

export const getVacanciesMethodName = "get-vacancies";

const getVacancies: ServiceMethodFn<Params, Vacancy> = async ({
  context,
  params,
}) => {
  const services = await db
    .select()
    .from(schema.service)
    .where(eq(schema.service.name, info.name));

  const service = services[0];

  if (!service) return;

  const vacancies: Vacancy[] = [];

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

    const isDataInvalid = !name || !url
    if (isDataInvalid) {
      break;
    }
    if (params && params.nameIncludes && !name.includes(params.nameIncludes)) {
      break;
    }

    const base = new URL(service.baseUrl).origin;

    vacancies.push({ name, url: `${base}${url}` });
  }

  await db.insert(schema.serviceData).values({
    data: vacancies,
    serviceId: service.id,
    method: "get-vacancies",
  });

  return { data: vacancies };
};

export { getVacancies };
