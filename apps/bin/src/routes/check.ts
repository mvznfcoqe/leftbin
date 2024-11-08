import { Hono } from "hono";

export const check = new Hono();

check.get("/", (ctx) => {
  return ctx.json({
    ok: true,
  });
});
