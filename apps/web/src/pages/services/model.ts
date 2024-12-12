import { getBaseUrl, getServicesResponse } from "@/shared/api/internal";
import { createJsonQuery, declareParams } from "@farfetched/core";
import { zodContract } from "@farfetched/zod";

export const servicesQuery = createJsonQuery({
  params: declareParams<{}>(),
  request: {
    method: "GET",
    url: getBaseUrl({ path: "/services" }),
  },
  response: {
    contract: zodContract(getServicesResponse),
  },
});
