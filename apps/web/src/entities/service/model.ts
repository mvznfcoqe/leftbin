import type { getServiceByServiceIdMethodsResponse, getServicesResponseItem } from "@/shared/api/internal";
import type { z } from "zod";

export type Service = z.infer<typeof getServicesResponseItem>;
export type ServiceMethod = z.infer<typeof getServiceByServiceIdMethodsResponse>['methods'][number]