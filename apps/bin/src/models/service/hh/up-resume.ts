import { db, schema } from "@/schema";
import { getMethodInfo, ServiceMethodFn } from "../lib";
import { info } from "./info";
import { gotoTimeout } from "../config";

const methodName = "up-resume";

type Params = {
  resumeName?: string;
};

const upResume: ServiceMethodFn<Params> = async ({ context }) => {
  const methodInfo = await getMethodInfo({
    methodName,
    serviceName: info.name,
  });

  if (!methodInfo) {
    throw new Error("Failed to get method info");
  }

  const { method, service, baseUrl } = methodInfo;

  const page = await context.newPage();
  await page.goto(baseUrl, { timeout: gotoTimeout });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: "screenshot.png", fullPage: true });

  await page.waitForSelector('div[data-qa="resume"]');
  const resumes = await page.locator('div[data-qa="resume"]').all();

  for (const index in resumes) {
    const upButton = resumes[index]
      .locator('button[data-qa="resume-update-button_actions"]')
      .first();

    if (!upButton) {
      break;
    }

    await upButton.click();
    await page.waitForTimeout(1500);
  }

  const inserted = await db
    .insert(schema.serviceData)
    .values({ serviceId: service.id, methodId: method.id, data: [] })
    .returning();

  const insertedData = inserted[0];

  return { data: [], insertedId: insertedData.id };
};

export { upResume, methodName };
