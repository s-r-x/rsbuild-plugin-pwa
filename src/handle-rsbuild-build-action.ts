import fs from "node:fs/promises";
import path from "node:path";
import chalk from "chalk";
import { generateSW, injectManifest } from "workbox-build";
import { buildCustomSw } from "./build-custom-sw.ts";
import {
  DEFAULT_SW_FILENAME,
  DEFAULT_WEB_APP_MANIFEST_FILENAME,
  DEFAULT_WORKBOX_BUILD_VALUES,
} from "./config.ts";
import { genRegisterSwScript } from "./gen-register-sw-script.ts";
import type { RsBuildActionHandlerCtx } from "./types-internal.ts";
import { formatLog, formatMs } from "./utils.ts";
import {
  normalizeWebAppManifest,
  serializeWebAppManifest,
} from "./web-app-manifest-utils.ts";
import { genWbModifyUrlPrefix } from "./workbox-utils.ts";

export function handleRsBuildBuildAction({
  rsbuildApi: api,
  pluginConfig: {
    webAppManifest: webAppManifestCfg,
    sw: swConfig,
    registerSw: registerSwCfg,
  },
  checkIfPluginDisabled,
  extractEnvBaseUrl,
  genSwUrl,
  genSwScope,
  extractAssetPrefix,
}: RsBuildActionHandlerCtx) {
  const swFilename = swConfig.filename || DEFAULT_SW_FILENAME;
  api.processAssets({ stage: "additional" }, async function (ctx) {
    if (checkIfPluginDisabled({ environmentName: ctx.environment.name })) {
      return;
    }

    const baseUrl = extractEnvBaseUrl(ctx.environment);

    await Promise.all([emitManifest(), emitRegisterSwScript()]);
    async function emitManifest() {
      if (webAppManifestCfg) {
        const manifest = await normalizeWebAppManifest(
          webAppManifestCfg.content,
          { baseUrl },
        );
        const name =
          webAppManifestCfg.filename || DEFAULT_WEB_APP_MANIFEST_FILENAME;
        const source = new ctx.sources.RawSource(
          serializeWebAppManifest(manifest, webAppManifestCfg.minify),
        );
        ctx.compilation.emitAsset(name, source, {
          minimized: true,
        });
        api.logger.debug(formatLog("web app manifest generated"));
      } else {
        api.logger.debug(formatLog("skipping web app manifest generation"));
      }
    }
    async function emitRegisterSwScript() {
      if (registerSwCfg?.type === "script") {
        const source = new ctx.sources.RawSource(
          await genRegisterSwScript({
            swUrl: genSwUrl({ environment: ctx.environment }),
            scope: genSwScope({ baseUrl }),
            features: registerSwCfg.features,
          }),
        );
        ctx.compilation.emitAsset(registerSwCfg.scriptName, source, {
          minimized: true,
        });
        api.logger.debug(formatLog("sw registration script generated"));
      }
    }
  });
  api.onAfterEnvironmentCompile(
    async function handleEnvironmentCompilation(opts) {
      const environment = opts.environment;
      const rootFolder = api.context.rootPath;
      if (checkIfPluginDisabled({ environmentName: environment.name })) {
        api.logger.debug(formatLog("plugin is disabled"));
        return;
      }
      const stats = opts.stats?.toJson({
        all: false,
        outputPath: true,
        assets: true,
      });
      if (!stats) return;
      const { outputPath, assets } = stats;
      if (!outputPath) return;

      api.logger.start(formatLog("generating..."));
      const buildStartedAt = performance.now();

      const assetsToPrecache = (assets || []).reduce((acc, asset) => {
        if (asset.name && !asset.name.endsWith(".map")) {
          acc.push(asset.name);
        }
        return acc;
      }, [] as string[]);

      const wbGlobPatterns = swConfig.include
        ? typeof swConfig.include === "function"
          ? swConfig.include(assetsToPrecache)
          : swConfig.include
        : assetsToPrecache;
      const defaultWbModifyUrlPrefix = genWbModifyUrlPrefix(
        extractAssetPrefix(environment),
      );
      if (swConfig.mode === "generateSw") {
        const {
          globIgnores = DEFAULT_WORKBOX_BUILD_VALUES.globIgnores,
          inlineWorkboxRuntime = DEFAULT_WORKBOX_BUILD_VALUES.inlineWorkboxRuntime,
          cleanupOutdatedCaches = DEFAULT_WORKBOX_BUILD_VALUES.cleanupOutdatedCaches,
          modifyURLPrefix = defaultWbModifyUrlPrefix,
          ...workboxOpts
        } = swConfig.workboxOptions || {};
        let sourcemap = workboxOpts.sourcemap;
        if (typeof sourcemap !== "boolean") {
          const rsbuildSourcemap = environment.config.output.sourceMap;
          sourcemap =
            typeof rsbuildSourcemap === "boolean"
              ? rsbuildSourcemap
              : Boolean(rsbuildSourcemap?.js);
        }
        const buildResult = await generateSW({
          ...workboxOpts,
          cleanupOutdatedCaches,
          globDirectory: outputPath,
          globIgnores,
          sourcemap,
          globPatterns: wbGlobPatterns,
          swDest: path.resolve(outputPath, swFilename),
          inlineWorkboxRuntime,
          modifyURLPrefix,
        });

        const buildTime = performance.now() - buildStartedAt;
        if (buildResult.warnings?.length) {
          api.logger.warn(formatLog(buildResult.warnings.join("\n")));
        }
        printSuccessMessage({ buildTime, precachedCount: buildResult.count });
      } else if (swConfig.mode === "injectManifest") {
        const {
          globIgnores = DEFAULT_WORKBOX_BUILD_VALUES.globIgnores,
          modifyURLPrefix = defaultWbModifyUrlPrefix,
          ...workboxOpts
        } = swConfig.workboxOptions || {};
        const rsbuildResult = await buildCustomSw({
          rootFolder,
          swSrc: swConfig.srcFile,
          minify: swConfig.minify ?? true,
        });

        const wbBuildResult = await injectManifest({
          ...workboxOpts,
          globDirectory: outputPath,
          globIgnores,
          globPatterns: wbGlobPatterns,
          swSrc: rsbuildResult.swDest,
          swDest: path.resolve(outputPath, swFilename),
          modifyURLPrefix: modifyURLPrefix,
        });

        // buildCustomSw cleanup
        await fs.rm(rsbuildResult.destDir, { recursive: true, force: true });

        const buildTime = performance.now() - buildStartedAt;
        if (wbBuildResult.warnings?.length) {
          api.logger.warn(formatLog(wbBuildResult.warnings.join("\n")));
        }
        printSuccessMessage({
          buildTime,
          precachedCount: wbBuildResult.count,
        });
      } else {
        api.logger.error(formatLog("Unknown SW mode"));
        return;
      }
    },
  );

  function printSuccessMessage({
    buildTime,
    precachedCount,
  }: {
    buildTime: number;
    precachedCount: number;
  }) {
    const successMessage = [
      `generated in ${chalk.bold(formatMs(buildTime))}`,
      `Precached files: ${chalk.bold(precachedCount)}`,
    ].join("\n");
    api.logger.success(formatLog(successMessage));
  }
}
