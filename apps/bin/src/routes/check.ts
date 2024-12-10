import Elysia from "elysia";

export const check = new Elysia({
  name: "check",
  tags: ["check"],
  prefix: "/check",
}).get("/", () => {
  return { ok: true };
});
