import Elysia, { t } from "elysia";

const checkRoute = new Elysia({ prefix: "/check" }).get(
  "/",
  () => {
    return { ok: true };
  },
  {
    detail: {
      responses: {
        "200": {
          description: "Success",
          content: {
            "application/json": {
              schema: t.Object({
                ok: t.Boolean(),
              }),
            },
          },
        },
      },
    },
  }
);

export { checkRoute }