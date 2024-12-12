import Elysia from "elysia";
import { telegram } from "./telegram";

const notificationsRoute = new Elysia({
  prefix: "/notifications",
}).use(telegram);

export { notificationsRoute };
