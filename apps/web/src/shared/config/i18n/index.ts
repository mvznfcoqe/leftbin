import { createI18n } from "vue-i18n";
import ru from "@/shared/assets/locales/ru.json";
import en from "@/shared/assets/locales/en.json";

const i18n = createI18n({
  locale: "en",
  availableLocales: ["en", "ru"],
  messages: {
    ru,
    en,
  },
});

export { i18n };
