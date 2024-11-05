import { Hono } from "hono";
import { telegram } from "./telegram";
import { bearerAuth } from "hono/bearer-auth";
import { env } from "@/env";

const notifications = new Hono();
notifications.use("/*", bearerAuth({ token: env.AUTH_TOKEN }));

notifications.route("/telegram", telegram);

export { notifications };
