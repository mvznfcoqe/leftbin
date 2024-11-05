import type { BrowserContext } from "playwright";

export type ServiceResponse<D = unknown> = { data: D[] } | undefined;
export type ServiceMethodFn<
  P = Record<string, unknown>,
  D = unknown
> = (params: {
  context: BrowserContext;
  params?: P;
}) => Promise<ServiceResponse<D>>;
