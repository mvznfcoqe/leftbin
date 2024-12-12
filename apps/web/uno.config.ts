import { defineConfig, presetIcons } from "unocss";
import { presetUno, presetTypography } from "unocss";
import presetAnimations from "unocss-preset-animations";
import { presetShadcn } from "unocss-preset-shadcn";
import presetTheme from "unocss-preset-theme";
import { icons } from "@iconify-json/lucide";

export default defineConfig({
  theme: {
    colors: {
      background: "hsl(240, 10%, 3.9%)",
      foreground: "hsl(0, 0%, 98%)",
      card: "hsl(240, 10%, 3.9%)",
      "card-foreground": "hsl(0, 0%, 98%)",
      popover: "hsl(240, 10%, 3.9%)",
      "popover-foreground": "hsl(0, 0%, 98%)",
      primary: "hsl(0, 0%, 98%)",
      "primary-foreground": "hsl(240, 5.9%, 10%)",
      secondary: "hsl(240, 3.7%, 15.9%)",
      "secondary-foreground": "hsl(0, 0%, 98%)",
      muted: "hsl(240, 3.7%, 15.9%)",
      "muted-foreground": "hsl(240, 5%, 64.9%)",
      accent: "hsl(240, 3.7%, 15.9%)",
      "accent-foreground": "hsl(0, 0%, 98%)",
      destructive: "hsl(0, 62.8%, 30.6%)",
      "destructive-foreground": "hsl(0, 85.7%, 97.3%)",
      border: "hsl(240, 3.7%, 15.9%)",
      input: "hsl(240, 3.7%, 15.9%)",
      ring: "hsl(240, 4.9%, 83.9%)",
    },
    borderRadius: {
      md: "0.5rem",
    },
  },
  presets: [
    presetTypography(),
    presetUno(),
    presetAnimations(),
    presetShadcn(),
    presetTheme({
      theme: {
        dark: {
          colors: {
            background: "hsl(240, 10%, 3.9%)",
            foreground: "hsl(0, 0%, 98%)",
            card: "hsl(240, 10%, 3.9%)",
            "card-foreground": "hsl(0, 0%, 98%)",
            popover: "hsl(240, 10%, 3.9%)",
            "popover-foreground": "hsl(0, 0%, 98%)",
            primary: "hsl(0, 0%, 98%)",
            "primary-foreground": "hsl(240, 5.9%, 10%)",
            secondary: "hsl(240, 3.7%, 15.9%)",
            "secondary-foreground": "hsl(0, 0%, 98%)",
            muted: "hsl(240, 3.7%, 15.9%)",
            "muted-foreground": "hsl(240, 5%, 64.9%)",
            accent: "hsl(240, 3.7%, 15.9%)",
            "accent-foreground": "hsl(0, 0%, 98%)",
            destructive: "hsl(0, 62.8%, 30.6%)",
            "destructive-foreground": "hsl(0, 85.7%, 97.3%)",
            border: "hsl(240, 3.7%, 15.9%)",
            input: "hsl(240, 3.7%, 15.9%)",
            ring: "hsl(240, 4.9%, 83.9%)",
          },
          borderRadius: {
            md: "0.5rem",
          },
        },
      },
    }) as any,
    presetIcons({
      collections: {
        lucide: () =>
          import("@iconify-json/lucide/icons.json").then((i) => i.default),
      },
    }),
  ],
});
