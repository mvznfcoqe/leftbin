/**
 * Generated by orval v7.3.0 🍺
 * Do not edit manually.
 * Elysia Documentation
 * Development documentation
 * OpenAPI spec version: 0.0.0
 */
import { z as zod } from "zod";

export const getCheckResponse = zod.object({
  ok: zod.boolean(),
});

export const postServiceCookiesByServiceIdParams = zod.object({
  serviceId: zod.string(),
});

export const postServiceCookiesByServiceIdBody = zod.object({
  cookies: zod.array(
    zod.object({
      name: zod.string().min(1),
      value: zod.string().min(1),
      domain: zod.string().min(1),
      path: zod.string().min(1),
      expires: zod.number(),
      httpOnly: zod.boolean(),
      secure: zod.boolean(),
    })
  ),
});

export const deleteServiceCookiesByServiceIdParams = zod.object({
  serviceId: zod.string(),
});

export const getServiceByServiceIdMethodsParams = zod.object({
  serviceId: zod.number(),
});

export const getServiceByServiceIdMethodsResponse = zod.object({
  methods: zod.array(
    zod.object({
      id: zod.number(),
      url: zod.string(),
      name: zod.string(),
      title: zod.string(),
      isCookiesRequired: zod.boolean(),
      type: zod.string(),
    })
  ),
  service: zod.object({
    id: zod.number(),
    name: zod.string(),
    title: zod.string(),
  }),
});

export const getServiceByServiceIdMethodsByMethodIdParams = zod.object({
  serviceId: zod.number(),
  methodId: zod.number(),
});

export const getServiceByServiceIdMethodsByMethodIdResponse = zod.object({
  methods: zod.object({
    id: zod.number(),
    url: zod.string(),
    name: zod.string(),
    title: zod.string(),
    isCookiesRequired: zod.boolean(),
    type: zod.string(),
  }),
  service: zod.object({
    id: zod.number(),
    name: zod.string(),
    title: zod.string(),
  }),
});

export const postServiceByServiceNameByMethodNameParams = zod.object({
  serviceName: zod.string(),
  methodName: zod.string(),
});

export const getServicesResponseItem = zod.object({
  id: zod.number(),
  title: zod.string(),
  name: zod.string(),
  baseUrl: zod.string(),
});
export const getServicesResponse = zod.array(getServicesResponseItem);

export const postNotificationsTelegramSetupBody = zod.object({
  telegramId: zod.number().min(1),
});
