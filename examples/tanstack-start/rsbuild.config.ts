import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { pluginTailwindcss } from "@rsbuild/plugin-tailwindcss";
import { tanstackStart } from "@tanstack/react-start/plugin/rsbuild";
import { pluginPWA } from "rsbuild-plugin-pwa";

export default defineConfig({
  plugins: [
    pluginReact(),
    pluginTailwindcss(),
    tanstackStart(),
    pluginPWA({
      registerSw: {
        type: "virtual-module",
      },
      disabled: (ctx) => ctx.environmentName !== "client",
    }),
  ],
});
