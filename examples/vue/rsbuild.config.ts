import { defineConfig } from "@rsbuild/core";
import { pluginVue } from "@rsbuild/plugin-vue";
import { pluginPWA } from "rsbuild-plugin-pwa";

// Docs: https://rsbuild.rs/config/
export default defineConfig({
  plugins: [pluginVue(), pluginPWA({ registerSw: { type: "virtual-module" } })],
});
