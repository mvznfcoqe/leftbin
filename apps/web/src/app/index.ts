import { createApp } from "vue";
import App from "./index.vue";
import { router } from "@/pages";

const app = createApp(App);

app.use(router);

app.mount("#app");
