import { createRouter, createWebHistory } from "vue-router";
import { ServicesPage } from "./services";
import { ServiceMethodsPage } from "./service-methods";
import { MethodPage } from "./method";

const routes = [
  {
    path: "/",
    component: ServicesPage,
  },
  {
    path: "/:serviceId/methods",
    component: ServiceMethodsPage,
  },
  {
    path: "/:serviceId/methods/:methodId",
    component: MethodPage,
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
