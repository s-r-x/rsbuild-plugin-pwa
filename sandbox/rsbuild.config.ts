import { defineConfig } from "@rsbuild/core";
import { pluginPWA } from "../src/plugin.ts";

export default defineConfig({
  dev: {
    hmr: true,
  },
  //server: {
  //  base: "/sandbox",
  //},
  plugins: [
    pluginPWA({
      dev: true,
      registerSw: {
        type: "script",
        scriptName: "my-reg-sw-script.js",
      },
      sw: {
        srcFile: "./src/sw.js",
        mode: "injectManifest",
      },
    }),
  ],
  source: {
    entry: {
      index: "./src/index.js",
    },
  },
});
