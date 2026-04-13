import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { generateSW } from "workbox-build";
import { buildCustomSw } from "./build-custom-sw.ts";
import {
  DEFAULT_SW_FILENAME,
  DEFAULT_WORKBOX_BUILD_VALUES,
  DEV_GENERATE_SW_GLOB_FOLDER,
  DEV_SUPPRESS_WORKBOX_WARNINGS_CONTENT,
  DEV_SUPPRESS_WORKBOX_WARNINGS_FILENAME,
  LOG_PREFIX,
} from "./config.ts";
import { genRegisterSwScript } from "./gen-register-sw-script.ts";
import type { WebAppManifest } from "./types.ts";
import type { RsBuildActionHandlerCtx } from "./types-internal.ts";
import { resetDir } from "./utils.ts";
import {
  genWebAppManifestUrl,
  normalizeWebAppManifest,
  serializeWebAppManifest,
} from "./web-app-manifest-utils.ts";
import { genWbModifyUrlPrefix } from "./workbox-utils.ts";

export function handleRsBuildDevAction({
  rsbuildApi: api,
  pluginConfig: {
    webAppManifest: webAppManifestCfg,
    sw: swConfig,
    registerSw: registerSwCfg,
  },
}: RsBuildActionHandlerCtx) {
  const swFilename = swConfig.filename || DEFAULT_SW_FILENAME;

  api.onBeforeStartDevServer(async function ({ server, environments }) {
    let baseUrl = "";
    for (const envName in environments) {
      const env = environments[envName];
      const base = env.config.server.base;
      if (env.config.output.target === "web" && base) {
        baseUrl = base;
        break;
      }
    }
    if (!baseUrl) baseUrl = "/";

    const manifestName = webAppManifestCfg
      ? genWebAppManifestUrl({
          baseUrl,
          filename: webAppManifestCfg.filename,
        })
      : undefined;
    const manifestPromise: Promise<WebAppManifest | null> =
      (async function generateDevWebAppManifest() {
        if (webAppManifestCfg) {
          return await normalizeWebAppManifest(webAppManifestCfg.content, {
            baseUrl,
          });
        } else {
          return null;
        }
      })();
    const swContentPromise: Promise<string> = (async function generateDevSw() {
      if (swConfig.mode === "injectManifest") {
        const rootFolder = api.context.rootPath;
        const buildResult = await buildCustomSw({
          rootFolder,
          swSrc: swConfig.srcFile,
          minify: true,
        });
        const content = await fs
          .readFile(buildResult.swDest, "utf8")
          .then((s) => s.replace("self.__WB_MANIFEST", "[]"));
        await fs.rm(buildResult.destDir, { recursive: true, force: true });
        return content;
      } else {
        const globDir = DEV_GENERATE_SW_GLOB_FOLDER;
        await resetDir(globDir);
        await fs.writeFile(
          path.join(globDir, DEV_SUPPRESS_WORKBOX_WARNINGS_FILENAME),
          "",
        );

        const {
          globIgnores = DEFAULT_WORKBOX_BUILD_VALUES.globIgnores,
          cleanupOutdatedCaches = DEFAULT_WORKBOX_BUILD_VALUES.cleanupOutdatedCaches,
          ...workboxOpts
        } = swConfig.workboxOptions || {};

        const outputDir = path.join(
          os.tmpdir(),
          "rsbuild-plugin-pwa-generate-sw-output-dev",
        );
        await fs.mkdir(outputDir, { recursive: true });
        const swDest = path.resolve(outputDir, swFilename);

        const buildResult = await generateSW({
          ...workboxOpts,
          cleanupOutdatedCaches,
          globDirectory: globDir,
          globIgnores,
          globPatterns: [DEV_SUPPRESS_WORKBOX_WARNINGS_FILENAME],
          swDest,
          inlineWorkboxRuntime: true,
          modifyURLPrefix: genWbModifyUrlPrefix(baseUrl),
        });
        if (buildResult.warnings?.length) {
          api.logger.warn(LOG_PREFIX + buildResult.warnings.join("\n"));
        }

        const sw = await fs.readFile(swDest, "utf8");
        await fs.rm(outputDir, { recursive: true, force: true });
        return sw;
      }
    })();
    server.middlewares.use(async function (req, res, next) {
      if (req.url === manifestName) {
        const manifest = await manifestPromise;
        if (webAppManifestCfg && manifest) {
          writeRes(
            serializeWebAppManifest(manifest, webAppManifestCfg.minify),
            "application/manifest+json",
          );
        } else {
          next();
        }
      } else if (
        registerSwCfg?.type === "script" &&
        req.url === path.posix.join(baseUrl, registerSwCfg.scriptName)
      ) {
        const manifest = await manifestPromise;
        writeRes(
          genRegisterSwScript({
            baseUrl,
            scope: manifest?.scope || baseUrl,
            swFilename,
            events: registerSwCfg.events,
          }),
          "text/javascript",
        );
      } else if (req.url === path.posix.join(baseUrl, swFilename)) {
        const sw = await swContentPromise;
        writeRes(sw, "text/javascript");
      } else if (
        req.url ===
        path.posix.join(baseUrl, DEV_SUPPRESS_WORKBOX_WARNINGS_FILENAME)
      ) {
        writeRes(DEV_SUPPRESS_WORKBOX_WARNINGS_CONTENT, "text/javascript");
      } else {
        next();
      }

      function writeRes(content: string, mime: string) {
        res.statusCode = 200;
        res.setHeader("Content-Type", mime);
        res.write(content, "utf-8");
        res.end();
      }
    });
  });
}
