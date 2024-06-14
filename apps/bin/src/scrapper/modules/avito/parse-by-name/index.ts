import playwright from "playwright";
import UserAgent from "user-agents";
import {
  ExportCookie,
  mapExportCookieToPlaywright,
} from "@/scrapper/lib/export-cookie";
import { logger, db } from "@/main";
import { avitoBin } from "@/scrapper/schema";
import { AvitoItem } from "./types";
import { parsePage } from "./page";

const parseByName = async (
  name: string,
  options: {
    cookies: ExportCookie[];
    geolocation?: playwright.Geolocation;
    pages: number;
    location?: string;
    vacancies: boolean;
  }
) => {
  const items: AvitoItem[] = [];

  const browser = await playwright["chromium"].launch({ timeout: 2000 });

  const userAgent = new UserAgent({ deviceCategory: "desktop" });

  logger.debug(userAgent.toString());

  const context = await browser.newContext({
    userAgent: userAgent.toString(),
    viewport: {
      width: 1920,
      height: 1080,
    },
    geolocation: options.geolocation,
  });

  if (options.cookies) {
    const authCookies = mapExportCookieToPlaywright(options.cookies);

    context.addCookies(authCookies);
  }

  try {
    for await (const page of [...Array(options.pages).keys()]) {
      const pageItems = await parsePage(name, context, {
        page: page + 1,
        location: options.location,
        vacancies: options.vacancies,
      });

      if (!pageItems) break;

      items.push(...pageItems);
    }

    logger.info(`Parsed items: ${items.length}`);
  } catch (error) {
    if (error instanceof Error) {
      logger.error("Failed to parse pages: " + error.name);
    }
  }

  await db.insert(avitoBin).values(items).onConflictDoNothing();
  await browser.close();
};

export { parseByName };
