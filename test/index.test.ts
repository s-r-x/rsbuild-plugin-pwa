import assert from "node:assert";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { createRsbuild, type RsbuildPlugin } from "@rsbuild/core";
import { pluginBabel } from "@rsbuild/plugin-babel";
import { pluginPreact } from "@rsbuild/plugin-preact";
import { pluginReact } from "@rsbuild/plugin-react";
import { pluginSolid } from "@rsbuild/plugin-solid";
import { pluginSvelte } from "@rsbuild/plugin-svelte";
import { pluginVue } from "@rsbuild/plugin-vue";
import * as cheerio from "cheerio";
import { DEFAULT_THEME_COLOR } from "../src/config.ts";
import {
  type HtmlTagsConfig,
  pluginPWA,
  type WebAppManifest,
} from "../src/index.ts";

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
  const iconTagConfig = {
    href: "/favicon.svg",
    type: "image/svg+xml",
    sizes: "32x32",
    fetchpriority: "high",
    crossorigin: "anonymous",
  } satisfies HtmlTagsConfig["icon"];
  const appleTouchIconTagConfig = {
    href: "touch-icon.png",
    sizes: "180x180",
  } satisfies HtmlTagsConfig["appleTouchIcon"];
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
          htmlTags: {
            themeColor: true,
            appleTouchIcon: appleTouchIconTagConfig,
            icon: iconTagConfig,
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
  const $themeColor = $('meta[name="theme-color"]');
  assert(
    $themeColor.attr("content") === DEFAULT_THEME_COLOR,
    '<meta name="theme-color" should be generated',
  );
  const $appleTouchIcon = $('link[rel="apple-touch-icon"]');
  for (const [k, v] of Object.entries(appleTouchIconTagConfig)) {
    assert(
      $appleTouchIcon.attr(k) === v,
      `<link rel="apple-touch-icon" ${k} should be ${v}`,
    );
  }
  const $icon = $('link[rel="icon"]');
  for (const [k, v] of Object.entries(iconTagConfig)) {
    assert($icon.attr(k) === v, `<link rel="icon" ${k} should be ${v}`);
  }

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
      theme_color: DEFAULT_THEME_COLOR,
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
    theme_color: "#000000",
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

const vmApps: Parameters<typeof testVmApp>[0][] = [
  {
    appDir: "vm-react-app",
    appName: "react",
    entryFile: "index.jsx",
    plugins: [pluginReact()],
  },
  {
    appDir: "vm-preact-app",
    appName: "preact",
    entryFile: "index.jsx",
    plugins: [pluginPreact()],
  },
  {
    appDir: "vm-vue-app",
    appName: "vue",
    entryFile: "index.js",
    plugins: [pluginVue()],
  },
  {
    appDir: "vm-svelte-app",
    appName: "svelte",
    entryFile: "index.ts",
    plugins: [pluginSvelte()],
  },
  {
    appDir: "vm-vanilla-app",
    appName: "vanilla js",
    entryFile: "index.js",
    plugins: [],
  },
  {
    appDir: "vm-solid-app",
    appName: "solid",
    entryFile: "index.jsx",
    plugins: [
      pluginBabel({
        include: /\.(?:jsx|tsx)$/,
      }),
      pluginSolid(),
    ],
  },
];
for (const cfg of vmApps) {
  testVmApp(cfg);
}
function testVmApp({
  plugins,
  appDir,
  entryFile,
  appName,
}: {
  plugins: RsbuildPlugin[];
  appDir: string;
  entryFile: string;
  appName: string;
}) {
  test(`should build a ${appName} app that uses a vm`, async function () {
    const result = await buildVmApp({
      appDir,
      entryFile,
      plugins,
    });
    assert(
      result.stats?.hasErrors() === false,
      "shouldn't be any build errors",
    );
  });
}
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
