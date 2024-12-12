import "virtual:uno.css";
import "@unocss/reset/tailwind.css";

import { createApp } from "vue";
import App from "./index.vue";
import { router } from "@/pages";
import { appStarted } from "@/shared/config/init";
import { i18n } from "@/shared/config/i18n";

const app = createApp(App);
app.use(router);
app.use(i18n);

appStarted();
app.mount("#app");
