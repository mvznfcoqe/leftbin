import { Hono } from "hono";
import { version } from "../../package.json";

export const check = new Hono();

check.get("/", (ctx) => {
  return ctx.json({
    version: version,
  });
});
