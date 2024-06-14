import { createEvent, sample } from "effector";
import { createJsonQuery } from "@farfetched/core";
import { binBaseUrl } from "~/shared/api/bin";
import { zodContract } from "@farfetched/zod";

import { z } from "zod";

export const appStarted = createEvent();

const checkStatusContract = z.object({
  status: z.string(),
  version: z.string(),
});

const checkBinStatus = createJsonQuery({
  request: {
    url: binBaseUrl("/check"),
    method: "GET",
  },
  response: {
    contract: zodContract(checkStatusContract),
  },
});

sample({
  clock: appStarted,
  target: checkBinStatus.start,
});
