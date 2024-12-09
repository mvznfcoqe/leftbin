import { logger } from "@/logger";
import {
  handleServiceMethodStarted,
  handleServiceMethodSucced,
  ServiceMethodFn,
  sleep,
} from "../lib";
import { info } from "./info";

const methodName = "up-resume";

type Params = {
  resumeName?: string;
};

const upResumeButtonName = "Поднять в поиске";

const upResume: ServiceMethodFn<Params> = async ({ page }) => {
  try {
    const { methodInfo } = await handleServiceMethodStarted({
      methodName,
      serviceName: info.name,
      page,
    });

    const { method, service } = methodInfo;

    await page.waitForSelector('div[data-qa="resume"]');
    const resumes = await page.$$('div[data-qa="resume"]');

    for (const resume of resumes) {
      const upButton = await resume.$(
        `::-p-xpath(//*[text()[contains(., "${upResumeButtonName}")]])`
      );

      if (!upButton) {
        continue;
      }

      await upButton.click();
      await sleep(1500);
    }

    return await handleServiceMethodSucced({ page, service, method, data: [] });
  } catch (e) {
    logger.error(e);
  }
};

export { methodName, upResume };
