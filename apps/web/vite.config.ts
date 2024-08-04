import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import UnoCSS from "unocss/vite";
import babel from "vite-plugin-babel";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [babel(), tsconfigPaths(), UnoCSS()],
});
