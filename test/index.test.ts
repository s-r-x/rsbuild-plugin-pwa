import assert from "node:assert";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { createRsbuild } from "@rsbuild/core";
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
      scope: baseUrl,
      start_url: baseUrl,
    } satisfies WebAppManifest,
    "web app manifest should include user defined values and some default ones",
  );

  assert(
    await fileExists(path.join(outputDir, swScriptName)),
    "sw should be generated",
  );
});
test.before(async function cleanup() {
  await fs.rm(baseOutputDir, { recursive: true, force: true });
});

async function fileExists(filePath: string): Promise<boolean> {
  return await fs
    .access(filePath)
    .then(() => true)
    .catch(() => false);
}
