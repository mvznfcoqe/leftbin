import playwright from "playwright";
import { baseUrl, getSearchBaseUrl } from "../base-url";
import { AvitoItem } from "./types";
import { errors } from "@/scrapper/errors";

const filters = {
  minPrice: 50000,
  maxPrice: 72000,
};
const accessDeniedTitle = "Доступ ограничен";

export const parsePage = async (
  name: string,
  context: playwright.BrowserContext,
  options: { page: number; location?: string; vacancies?: boolean }
) => {
  const searchBaseUrl = getSearchBaseUrl({
    query: name,
    delivery: true,
    page: options.page,
    vacancies: options.vacancies,
  });

  const items: AvitoItem[] = [];

  const page = await context.newPage();
  await page.goto(searchBaseUrl);
  await page.waitForTimeout(1000);

  await page.screenshot();

  const title = await page.title();

  if (title.includes(accessDeniedTitle)) {
    throw new Error(errors.blockedByIp);
  }

  try {
    await page.waitForSelector("[data-marker='catalog-serp']", {});
  } catch {
    return;
  }

  const itemsContainer = page.locator("[data-marker='catalog-serp']");

  await page.waitForSelector("[data-marker='item']");
  const locators = await itemsContainer.locator("[data-marker='item']").all();

  for (const index in locators) {
    const title =
      (await locators[index].locator("[itemprop='name']").textContent()) ||
      "No name";

    const rawPrice =
      (await locators[index].locator("[itemprop='offers']").textContent()) ||
      "0";

    const price = parseInt(rawPrice.replace(/\s/g, ""));

    if (price > filters.maxPrice || price < filters.minPrice) continue;

    const url = await locators[index]
      .locator("[itemprop='url']")
      .first()
      .getAttribute("href");

    items.push({
      title: title,
      price,
      url: `${baseUrl}${url}`,
      request: name,
    });
  }

  page.waitForTimeout(2500);

  return items;
};
