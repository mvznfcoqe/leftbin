import {
  createServiceMethodFn,
  ServiceMethodAction,
  ServiceMethodData,
  sleep,
} from "../../lib";
import { serviceName } from "../info";

const methodName = "up-resume";

type Params = {
  resumeName?: string;
};

const upResumeButtonName = "Поднять в поиске";

const upResumeMethodAction: ServiceMethodAction<Params> = async ({ page }) => {
  await page.waitForSelector('div[data-qa="resume"]');
  const resumes = await page.$$('div[data-qa="resume"]');

  const uppedResumeTitles: ServiceMethodData = [];

  for (const resume of resumes) {
    const upButton = await resume.$(
      `::-p-xpath(//*[text()[contains(., "${upResumeButtonName}")]])`
    );
    const resumeTitle = await resume.$eval("[data-qa=title]", (title: { innerText: any; }) => {
      return title.innerText;
    });

    if (!upButton) {
      continue;
    }

    uppedResumeTitles.push({ id: resumeTitle, title: resumeTitle });

    await upButton.click();
    await sleep(1500);
  }

  if (!uppedResumeTitles.length) {
    return {
      data: uppedResumeTitles,
      message:
        "Не найдены резюме для поднятия. Возможно, время для поднятия еще не настало.",
      status: "failure",
    };
  }

  return {
    data: uppedResumeTitles,
    message: "Успешно поднятые резюме:",
    status: "success",
  };
};

const upResumeMethod = createServiceMethodFn({
  fn: upResumeMethodAction,
  methodName,
  serviceName,
});

export { methodName, upResumeMethod };
