import { createRouter, createWebHistory } from "vue-router";
import { MainPage } from "./main";

const routes = [
  {
    path: "/",
    component: MainPage,
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
