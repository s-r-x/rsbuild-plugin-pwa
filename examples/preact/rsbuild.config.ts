import { defineConfig } from "@rsbuild/core";
import { pluginPreact } from "@rsbuild/plugin-preact";
import { pluginPWA } from "rsbuild-plugin-pwa";

// Docs: https://rsbuild.rs/config/
export default defineConfig({
  plugins: [
    pluginPreact(),
    pluginPWA({ registerSw: { type: "virtual-module" } }),
  ],
});
