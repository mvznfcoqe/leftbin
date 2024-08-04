import { defineConfig } from "unocss";
import presetUno from "@unocss/preset-uno";
import presetTypography from "@unocss/preset-typography";
import presetAnimations from "unocss-preset-animations";
import { presetShadcn } from "unocss-preset-shadcn";

export default defineConfig({
  presets: [
    presetUno(),
    presetTypography(),
    presetAnimations(),
    presetShadcn(),
  ],
  content: {
    pipeline: {
      include: ["src/**/*.{js,ts}", "index.html"],
    },
  },
});
