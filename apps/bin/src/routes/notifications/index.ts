import Elysia from "elysia";
import { telegram } from "./telegram";

const notifications = new Elysia({
  prefix: "/notifications",
  name: "notifications",
  tags: ["notifications"],
}).use(telegram);

export { notifications };
