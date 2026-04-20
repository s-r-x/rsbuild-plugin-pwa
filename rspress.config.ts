import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "@rspress/core";
import { pluginTypeDoc } from "@rspress/plugin-typedoc";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const pkgJson: { name: string } = JSON.parse(
  fs.readFileSync(path.join(__dirname, "package.json"), "utf8"),
);
const title = pkgJson.name;
export default defineConfig({
  title,
  base: pkgJson.name,
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
  builderConfig: {
    source: {
      tsconfigPath: path.join(__dirname, "./tsconfig.docs.json"),
    },
  },
  plugins: [
    pluginTypeDoc({
      entryPoints: [
        path.join(__dirname, "src", "index.ts"),
        path.join(__dirname, "src", "vm", "main/register-sw.ts"),
        path.join(__dirname, "src", "vm", "main/react.ts"),
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
