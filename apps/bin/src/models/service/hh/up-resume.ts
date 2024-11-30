import { db, schema } from "@/schema";
import { sleep, getMethodInfo, ServiceMethodFn } from "../lib";
import { info } from "./info";
import { gotoTimeout } from "../config";

const methodName = "up-resume";

type Params = {
  resumeName?: string;
};

const upResume: ServiceMethodFn<Params> = async ({ page }) => {
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

  await page.waitForSelector('div[data-qa="resume"]');
  const resumes = await page.$$('div[data-qa="resume"]');

  for (const index in resumes) {
    const upButton = await resumes[index].$(
      'button[data-qa="resume-update-button_actions"]'
    );

    if (!upButton) {
      break;
    }

    await upButton.click();
    await sleep(1500);
  }

  const inserted = await db
    .insert(schema.serviceData)
    .values({ serviceId: service.id, methodId: method.id, data: [] })
    .returning();

  const insertedData = inserted[0];

  return { data: [], insertedId: insertedData.id };
};

export { upResume, methodName };
