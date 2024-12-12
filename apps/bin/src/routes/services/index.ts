import { getServices } from "@/models/services";
import { schemaTypebox } from "@/schema";
import Elysia, { t } from "elysia";

const { service } = schemaTypebox.select;

const servicesRoute = new Elysia({
  prefix: "/services",
}).get(
  "/",
  () => {
    const services = getServices();

    return services;
  },
  {
    detail: {
      // It works, but typescript dont like it
      // @ts-ignore
      responses: {
        "200": {
          description: "Success",
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: t.Object({
                  id: service.id,
                  title: service.title,
                  name: service.name,
                  baseUrl: service.baseUrl,
                }),
              },
            },
          },
        },
      },
    },
  }
);

export { servicesRoute };
