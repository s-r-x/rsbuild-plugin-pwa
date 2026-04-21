import { defineConfig } from "@rsbuild/core";
import { pluginPWA } from "rsbuild-plugin-pwa";

export default defineConfig({
  server: {
    base: "/app",
  },
  plugins: [pluginPWA({ registerSw: { type: "virtual-module" } })],
});
