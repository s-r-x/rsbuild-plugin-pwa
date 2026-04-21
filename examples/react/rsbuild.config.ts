import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { pluginPWA } from "rsbuild-plugin-pwa";

export default defineConfig({
  plugins: [
    pluginReact(),
    pluginPWA({ registerSw: { type: "virtual-module" }, dev: true }),
  ],
});
