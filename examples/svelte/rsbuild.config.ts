import { defineConfig } from "@rsbuild/core";
import { pluginSvelte } from "@rsbuild/plugin-svelte";
import { pluginPWA } from "rsbuild-plugin-pwa";

// Docs: https://rsbuild.rs/config/
export default defineConfig({
  plugins: [
    pluginSvelte(),
    pluginPWA({ registerSw: { type: "virtual-module" } }),
  ],
});
