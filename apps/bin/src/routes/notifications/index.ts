import { Hono } from "hono";
import { telegram } from "./telegram";

const notifications = new Hono();

notifications.route("/telegram", telegram);

export { notifications };
