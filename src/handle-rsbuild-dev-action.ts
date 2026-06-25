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
  checkIfPluginDisabled,
  extractAssetPrefix,
}: RsBuildActionHandlerCtx) {
  const swFilename = swConfig.filename || DEFAULT_SW_FILENAME;

  let swContentPromise: Promise<string> | null = null;

  function getSwContent(env: EnvironmentContext): Promise<string> {
    if (!swContentPromise) {
      swContentPromise = generateDevSw(env);
    }
    return swContentPromise;
  }

  async function generateDevSw(env: EnvironmentContext): Promise<string> {
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
    }

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

  api.onBeforeStartDevServer(function ({ environments }) {
    for (const envName in environments) {
      const env_ = environments[envName];
      if (!checkIfPluginDisabled({ environmentName: env_.name })) {
        // onBeforeStartDevServer fires before the processAssets so we kick off the sw generation earlier
        getSwContent(env_);
        break;
      }
    }
  });

  api.processAssets({ stage: "additional" }, async function (ctx) {
    if (checkIfPluginDisabled({ environmentName: ctx.environment.name })) {
      return;
    }
    const swContent = await getSwContent(ctx.environment);
    ctx.compilation.emitAsset(swFilename, new ctx.sources.RawSource(swContent));
    ctx.compilation.emitAsset(
      DEV_SUPPRESS_WORKBOX_WARNINGS_FILENAME,
      new ctx.sources.RawSource(DEV_SUPPRESS_WORKBOX_WARNINGS_CONTENT),
    );
    api.logger.debug(formatLog("dev service worker emitted"));
  });
}
