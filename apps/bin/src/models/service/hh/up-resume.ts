import { db, schema } from "@/schema";
import { sleep, getMethodInfo, ServiceMethodFn } from "../lib";
import { info } from "./info";
import { gotoTimeout } from "../config";
import { logger } from "@/index";

const methodName = "up-resume";

type Params = {
  resumeName?: string;
};

const upResumeButtonName = "Поднять в поиске";

const upResume: ServiceMethodFn<Params> = async ({ page }) => {
  try {
    const methodInfo = await getMethodInfo({
      methodName,
      serviceName: info.name,
    });

    if (!methodInfo) {
      throw new Error("Failed to get method info");
    }

    const { method, service, baseUrl } = methodInfo;

    await page.goto(baseUrl, { timeout: gotoTimeout });
    await sleep(1000);
    logger.debug("[up-resume]: Page Opened");

    await page.waitForSelector('div[data-qa="resume"]');
    const resumes = await page.$$('div[data-qa="resume"]');
    logger.debug("[up-resume]: Resumes collected");

    for (const resume of resumes) {
      const upButton = await resume.$(
        `::-p-xpath(//*[text()[contains(., "${upResumeButtonName}")]])`
      );

      if (!upButton) {
        logger.warn("[up-resume]: Resume update button was not found");
        continue;
      }

      await sleep(1500);
      logger.debug("[up-resume]: Resume update button clicked");
    }

    await page.close();
    logger.debug("[up-resume]: Page Closed");

    const inserted = await db
      .insert(schema.serviceData)
      .values({ serviceId: service.id, methodId: method.id, data: [] })
      .returning();

    const insertedData = inserted[0];

    return { data: [], insertedId: insertedData.id };
  } catch (e) {
    console.log(e);
  }
};

export { upResume, methodName };
