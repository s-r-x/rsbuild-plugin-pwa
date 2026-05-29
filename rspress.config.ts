import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "@rspress/core";
import { pluginTypeDoc } from "@rspress/plugin-typedoc";
import { pluginPWA } from "./src/plugin.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const pkgJson: { name: string } = JSON.parse(
  fs.readFileSync(path.join(__dirname, "package.json"), "utf8"),
);
const title = pkgJson.name;
const baseUrl = "/" + pkgJson.name + "/";
export default defineConfig({
  title,
  base: baseUrl,
  lang: "en",
  locales: [
    {
      lang: "en",
      label: "English",
      title,
      description: "Zero-config PWA support for rsbuild",
    },
    {
      lang: "ru",
      label: "Русский",
      title,
      description: "Zero-config PWA для Rsbuild",
    },
  ],
  root: "docs-src",
  outDir: "docs",
  globalUIComponents: [
    path.join(__dirname, "docs-src", "ServiceWorkerManager.tsx"),
  ],
  builderConfig: {
    plugins: [
      pluginPWA({
        htmlTags: {
          icon: [
            {
              href: baseUrl + "favicon-16x16.png",
              sizes: "16x16",
              type: "image/png",
            },
            {
              href: baseUrl + "favicon-32x32.png",
              sizes: "32x32",
              type: "image/png",
            },
            {
              href: baseUrl + "favicon.svg",
              type: "image/svg+xml",
            },
          ],
        },
        webAppManifest: {
          content: {
            display: "minimal-ui",
            theme_color: "#ffffff",
            icons: [
              {
                src: baseUrl + "icon-192x192.png",
                sizes: "192x192",
                type: "image/png",
              },
              {
                src: baseUrl + "icon-512x512.png",
                sizes: "512x512",
                type: "image/png",
              },
            ],
          },
        },
        sw: {
          mode: "injectManifest",
          includeWebAppManifestIcons: [0],
          include(assets) {
            return assets.concat(["favicon.svg"]);
          },
          srcFile: path.join(__dirname, "docs-sw.ts"),
        },
        registerSw: {
          type: "virtual-module",
        },
      }),
    ],
  },
  plugins: [
    pluginTypeDoc({
      entryPoints: [
        path.join(__dirname, "src", "index.ts"),
        path.join(__dirname, "src", "vm", "main/register-sw.ts"),
        path.join(__dirname, "src", "vm", "main/react.ts"),
        path.join(__dirname, "src", "vm", "main/vue.ts"),
        path.join(__dirname, "src", "vm", "main/svelte.ts"),
        path.join(__dirname, "src", "vm", "main/solid.ts"),
        path.join(__dirname, "src", "vm", "main/preact.ts"),
        path.join(__dirname, "src", "vm", "main/debug.ts"),
      ],
    }),
  ],
  markdown: {
    link: {
      checkDeadLinks: {
        // typedoc plugin is broken when using localization
        excludes: (url) => url.startsWith("/api"),
      },
    },
  },
  //markdown: {
  //  link: {
  //    checkDeadLinks: {
  //      // Ignore any links that contain "/api"
  //      excludes: [/^\/api/, /^\/ru\/api/],
  //    },
  //  },
  //},
});
