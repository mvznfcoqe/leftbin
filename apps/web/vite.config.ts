import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";
import UnoCSS from "unocss/vite";
import babel from "vite-plugin-babel";
import vuei18nplugin from '@intlify/unplugin-vue-i18n/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [babel(), UnoCSS({}), vue(), vueDevTools(), vuei18nplugin()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    hmr: false,
    port: 8002,
    proxy: {
      "/api": {
        target: "http://localhost:9001/",
        changeOrigin: true,
        secure: false,
        ws: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
      "/swagger/json": {
        target: "http://localhost:9001/",
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
  },
});
