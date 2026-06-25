import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type { EnvironmentContext } from "@rsbuild/core";
import { generateSW } from "workbox-build";
import { buildCustomSw } from "./build-custom-sw.ts";
import {
  DEFAULT_SW_FILENAME,
  DEFAULT_WORKBOX_BUILD_VALUES,
  DEV_GENERATE_SW_GLOB_FOLDER,
  DEV_SUPPRESS_WORKBOX_WARNINGS_CONTENT,
  DEV_SUPPRESS_WORKBOX_WARNINGS_FILENAME,
} from "./config.ts";
import type { RsBuildActionHandlerCtx } from "./types-internal.ts";
import { formatLog, resetDir } from "./utils.ts";
import { genWbModifyUrlPrefix } from "./workbox-utils.ts";

export function handleRsBuildDevAction({
  rsbuildApi: api,
  pluginConfig: { sw: swConfig },
  genSwUrl,
  normalizeAssetUrl,
  extractAssetPrefix,
}: RsBuildActionHandlerCtx) {
  api.onBeforeStartDevServer(async function ({ server, environments }) {
    const swFilename = swConfig.filename || DEFAULT_SW_FILENAME;

    let env: EnvironmentContext | null = null;
    for (const envName in environments) {
      const env_ = environments[envName];
      if (env_.config.output.target === "web") {
        env = env_;
        break;
      }
    }
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
          modifyURLPrefix = genWbModifyUrlPrefix(extractAssetPrefix(env)),
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
          modifyURLPrefix,
        });
        if (buildResult.warnings?.length) {
          api.logger.warn(formatLog(buildResult.warnings.join("\n")));
        }

        const sw = await fs.readFile(swDest, "utf8");
        await fs.rm(outputDir, { recursive: true, force: true });
        return sw;
      }
    })();
    const swUrl = genSwUrl({ environment: env });
    server.middlewares.use(function (req, res, next) {
      if (req.url === swUrl) {
        swContentPromise.then(function (sw) {
          writeRes(sw, "text/javascript");
        });
      } else if (
        req.url ===
        normalizeAssetUrl({
          environment: env,
          asset: DEV_SUPPRESS_WORKBOX_WARNINGS_FILENAME,
        })
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
