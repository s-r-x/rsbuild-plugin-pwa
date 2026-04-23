import { defineConfig } from "@rsbuild/core";
import { pluginBabel } from "@rsbuild/plugin-babel";
import { pluginSolid } from "@rsbuild/plugin-solid";
import { pluginPWA } from "rsbuild-plugin-pwa";

// Docs: https://rsbuild.rs/config/
export default defineConfig({
  plugins: [
    pluginBabel({
      include: /\.(?:jsx|tsx)$/,
    }),
    pluginSolid(),
    pluginPWA({ registerSw: { type: "virtual-module" } }),
  ],
});
