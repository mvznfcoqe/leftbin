import {
  getBaseUrl,
  getServiceByServiceIdMethodsParams,
  getServiceByServiceIdMethodsResponse,
} from "@/shared/api/internal";
import { createJsonQuery, declareParams } from "@farfetched/core";
import { zodContract } from "@farfetched/zod";
import type { z } from "zod";

export const serviceMethodsQuery = createJsonQuery({
  params: declareParams<z.infer<typeof getServiceByServiceIdMethodsParams>>(),
  request: {
    method: "GET",
    url: ({ serviceId }) =>
      getBaseUrl({ path: `/service/${serviceId}/methods` }),
  },
  response: {
    contract: zodContract(getServiceByServiceIdMethodsResponse),
  },
});
