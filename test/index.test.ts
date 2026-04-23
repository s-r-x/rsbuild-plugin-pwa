import assert from "node:assert";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { createRsbuild, type RsbuildPlugin } from "@rsbuild/core";
import { pluginBabel } from "@rsbuild/plugin-babel";
import { pluginReact } from "@rsbuild/plugin-react";
import { pluginSolid } from "@rsbuild/plugin-solid";
import { pluginSvelte } from "@rsbuild/plugin-svelte";
import { pluginVue } from "@rsbuild/plugin-vue";
import * as cheerio from "cheerio";
import { pluginPWA, type WebAppManifest } from "../src/index.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const baseOutputDir = path.join(__dirname, "dist");
function genOutputDir(): string {
  const outputDir = path.join(
    baseOutputDir,
    `app-${crypto.randomBytes(8).toString("base64url")}`,
  );
  return outputDir;
}
test("should generate and inject into html pwa related stuff", async function () {
  const baseUrl = "/my-app";
  const registerSwScriptName = "my-register-sw.js";
  const swScriptName = "my-sw.js";
  const webAppManifestName = "my-manifest.webmanifest";
  const outputDir = genOutputDir();
  const appDir = path.resolve(__dirname, "app");
  const entrypoint = path.join(appDir, "index.ts");
  const webAppManifestContent: WebAppManifest = {
    name: "app",
    description: "desc",
  };
  const rsbuild = await createRsbuild({
    cwd: __dirname,
    rsbuildConfig: {
      logLevel: "error",
      plugins: [
        pluginPWA({
          webAppManifest: {
            filename: webAppManifestName,
            content: webAppManifestContent,
          },
          registerSw: {
            type: "script",
            scriptName: registerSwScriptName,
          },
          sw: {
            mode: "generateSw",
            filename: swScriptName,
          },
        }),
      ],
      security: {
        nonce: "test-nonce",
      },
      source: {
        entry: {
          index: entrypoint,
        },
      },
      server: {
        base: baseUrl,
      },
      output: {
        distPath: outputDir,
        filenameHash: false,
        dataUriLimit: 0,
      },
      tools: {
        htmlPlugin: true,
      },
    },
  });
  await rsbuild.build();
  const html = await fs.readFile(path.join(outputDir, "index.html"), "utf8");
  const $ = cheerio.load(html);

  const $registerSwScript = $(
    `script[src="${baseUrl + "/" + registerSwScriptName}"]`,
  )[0];
  assert($registerSwScript, "register sw script should be in html");

  const $manifest = $(
    `link[rel="manifest"][href="${baseUrl + "/" + webAppManifestName}"]`,
  )[0];
  assert($manifest, "link to web app manifest should be in html");

  const webAppManifest = await fs
    .readFile(path.join(outputDir, webAppManifestName), "utf8")
    .then((value) => JSON.parse(value) as WebAppManifest)
    .catch(() => null);
  assert(webAppManifest, "web app manifest should be generated");
  assert.partialDeepStrictEqual(
    webAppManifest,
    {
      ...webAppManifestContent,
      scope: baseUrl + "/",
      start_url: baseUrl,
    } satisfies WebAppManifest,
    "web app manifest should include user defined values and some default ones",
  );

  assert(
    await fileExists(path.join(outputDir, swScriptName)),
    "sw should be generated",
  );
});
test("should generate asset urls based on output.assetPrefix if it's defined", async function () {
  const baseUrl = "/my-app";
  const registerSwScriptName = "my-register-sw.js";
  const swScriptName = "my-sw.js";
  const webAppManifestName = "my-manifest.webmanifest";
  const outputDir = genOutputDir();
  const appDir = path.resolve(__dirname, "app");
  const entrypoint = path.join(appDir, "index.ts");
  const webAppManifestContent: WebAppManifest = {
    name: "app",
    description: "desc",
  };
  const assetPrefix = "https://cdn.example.com/assets/";
  const rsbuild = await createRsbuild({
    cwd: __dirname,
    rsbuildConfig: {
      logLevel: "error",
      plugins: [
        pluginPWA({
          webAppManifest: {
            filename: webAppManifestName,
            content: webAppManifestContent,
          },
          registerSw: {
            type: "script",
            scriptName: registerSwScriptName,
          },
          sw: {
            mode: "generateSw",
            filename: swScriptName,
          },
        }),
      ],
      source: {
        entry: {
          index: entrypoint,
        },
      },
      server: {
        base: baseUrl,
      },
      output: {
        distPath: outputDir,
        filenameHash: false,
        assetPrefix,
        dataUriLimit: 0,
      },
      tools: {
        htmlPlugin: true,
      },
    },
  });
  await rsbuild.build();
  const html = await fs.readFile(path.join(outputDir, "index.html"), "utf8");
  const $ = cheerio.load(html);

  const $registerSwScript = $(
    `script[src="${assetPrefix + registerSwScriptName}"]`,
  )[0];
  assert($registerSwScript, "register sw script should be in html");

  const $manifest = $(
    `link[rel="manifest"][href="${assetPrefix + webAppManifestName}"]`,
  )[0];
  assert($manifest, "link to web app manifest should be in html");

  const webAppManifest = await fs
    .readFile(path.join(outputDir, webAppManifestName), "utf8")
    .then((value) => JSON.parse(value) as WebAppManifest)
    .catch(() => null);
  assert(webAppManifest, "web app manifest should be generated");
  assert.partialDeepStrictEqual(
    webAppManifest,
    {
      ...webAppManifestContent,
      scope: baseUrl + "/",
      start_url: baseUrl,
    } satisfies WebAppManifest,
    "web app manifest should include user defined values and some default ones",
  );

  assert(
    await fileExists(path.join(outputDir, swScriptName)),
    "sw should be generated",
  );
});
test("should generate and inject into html pwa related stuff in 'injectManifest' mode", async function () {
  const registerSwScriptName = "my-register-sw.js";
  const swScriptName = "sw-with-injected-manifest.js";
  const webAppManifestName = "my-manifest.webmanifest";
  const outputDir = genOutputDir();
  const appDir = path.resolve(__dirname, "inject-manifest-app");
  const entrypoint = path.join(appDir, "index.ts");
  const rsbuild = await createRsbuild({
    cwd: __dirname,
    rsbuildConfig: {
      logLevel: "error",
      plugins: [
        pluginPWA({
          webAppManifest: false,
          registerSw: {
            type: "script",
            scriptName: registerSwScriptName,
          },
          sw: {
            mode: "injectManifest",
            srcFile: path.join(appDir, "custom-sw.ts"),
            filename: swScriptName,
          },
        }),
      ],
      security: {
        nonce: "test-nonce",
      },
      source: {
        entry: {
          index: entrypoint,
        },
      },
      output: {
        distPath: outputDir,
        filenameHash: false,
        dataUriLimit: 0,
      },
      tools: {
        htmlPlugin: true,
      },
    },
  });
  await rsbuild.build();
  const html = await fs.readFile(path.join(outputDir, "index.html"), "utf8");
  const $ = cheerio.load(html);

  const $registerSwScript = $(`script[src="${"/" + registerSwScriptName}"]`)[0];
  assert($registerSwScript, "register sw script should be in html");

  const $manifest = $(
    `link[rel="manifest"][href="${"/" + webAppManifestName}"]`,
  )[0];
  assert(!$manifest, "link to web app manifest shouldn't be in html");

  const webAppManifest = await fs
    .readFile(path.join(outputDir, webAppManifestName), "utf8")
    .then((value) => JSON.parse(value) as WebAppManifest)
    .catch(() => null);
  assert(!webAppManifest, "web app manifest shouldn't be generated");

  assert(
    await fileExists(path.join(outputDir, swScriptName)),
    "sw should be generated",
  );
});
test("should build a react app that imports useRegisterSW vm", async function () {
  const result = await buildVmApp({
    appDir: "vm-react-app",
    entryFile: "index.jsx",
    plugins: [pluginReact()],
  });
  assert(result.stats?.hasErrors() === false, "shouldn't be any build errors");
});
test("should build a vue app that imports useRegisterSW vm", async function () {
  const result = await buildVmApp({
    appDir: "vm-vue-app",
    entryFile: "index.js",
    plugins: [pluginVue()],
  });
  assert(result.stats?.hasErrors() === false, "shouldn't be any build errors");
});
test("should build a svelte app that imports useRegisterSW vm", async function () {
  const result = await buildVmApp({
    appDir: "vm-svelte-app",
    entryFile: "index.ts",
    plugins: [pluginSvelte()],
  });
  assert(result.stats?.hasErrors() === false, "shouldn't be any build errors");
});
test("should build a vanilla js app that imports registerSW vm", async function () {
  const result = await buildVmApp({
    appDir: "vm-vanilla-app",
    entryFile: "index.js",
    plugins: [],
  });
  assert(result.stats?.hasErrors() === false, "shouldn't be any build errors");
});
test("should build a solid app that imports useRegisterSW vm", async function () {
  const result = await buildVmApp({
    appDir: "vm-solid-app",
    entryFile: "index.jsx",
    plugins: [
      pluginBabel({
        include: /\.(?:jsx|tsx)$/,
      }),
      pluginSolid(),
    ],
  });
  assert(result.stats?.hasErrors() === false, "shouldn't be any build errors");
});
async function buildVmApp({
  appDir: baseAppDir,
  plugins,
  entryFile,
}: {
  appDir: string;
  entryFile: string;
  plugins: RsbuildPlugin[];
}) {
  const outputDir = genOutputDir();
  const appDir = path.resolve(__dirname, baseAppDir);
  const entrypoint = path.join(appDir, entryFile);
  const rsbuild = await createRsbuild({
    cwd: __dirname,
    rsbuildConfig: {
      logLevel: "error",
      plugins: [
        ...plugins,
        pluginPWA({
          registerSw: {
            type: "virtual-module",
          },
        }),
      ],
      source: {
        entry: {
          index: entrypoint,
        },
      },
      output: {
        distPath: outputDir,
        filenameHash: false,
        dataUriLimit: 0,
      },
      tools: {
        htmlPlugin: true,
      },
    },
  });
  return await rsbuild.build();
}
test.before(async function cleanup() {
  await fs.rm(baseOutputDir, { recursive: true, force: true });
});

async function fileExists(filePath: string): Promise<boolean> {
  return await fs
    .access(filePath)
    .then(() => true)
    .catch(() => false);
}
