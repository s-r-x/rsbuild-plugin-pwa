import fs from "node:fs/promises";
import path from "node:path";
import chalk from "chalk";
import type { ImageResource } from "web-app-manifest";
import { generateSW, injectManifest } from "workbox-build";
import { buildCustomSw } from "./build-custom-sw.ts";
import {
  DEFAULT_SW_FILENAME,
  DEFAULT_WORKBOX_BUILD_VALUES,
  GARBAGE_ASSET_PATTERN,
} from "./config.ts";
import type { RsBuildActionHandlerCtx } from "./types-internal.ts";
import { formatLog, formatMs } from "./utils.ts";
import { genWbModifyUrlPrefix } from "./workbox-utils.ts";

export function handleRsBuildBuildAction({
  rsbuildApi: api,
  pluginConfig: { webAppManifest: webAppManifestCfg, sw: swConfig },
  checkIfPluginDisabled,
  extractAssetPrefix,
}: RsBuildActionHandlerCtx) {
  const swFilename = swConfig.filename || DEFAULT_SW_FILENAME;
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

      const { assetsToPrecache, initialAssetsToPrecache } = (
        assets || []
      ).reduce(
        (acc, asset) => {
          const assetName = asset?.name;
          if (assetName) {
            acc.initialAssetsToPrecache.push(assetName);
            if (!GARBAGE_ASSET_PATTERN.test(assetName)) {
              acc.assetsToPrecache.push(assetName);
            }
          }
          return acc;
        },
        {
          assetsToPrecache: [] as string[],
          initialAssetsToPrecache: [] as string[],
        },
      );
      if (
        swConfig.includeWebAppManifestIcons &&
        webAppManifestCfg !== false &&
        webAppManifestCfg.content?.icons?.length
      ) {
        const assetPrefix = extractAssetPrefix(environment);
        if (Array.isArray(swConfig.includeWebAppManifestIcons)) {
          for (const idx of swConfig.includeWebAppManifestIcons) {
            const icon = webAppManifestCfg.content.icons[idx];
            if (!icon) {
              api.logger.warn(
                formatLog(
                  `Cannot precache web app manifest icon at index ${idx} cause it's not defined`,
                ),
              );
              continue;
            }
            processIcon(icon);
          }
        } else {
          for (const icon of webAppManifestCfg.content.icons) {
            processIcon(icon);
          }
        }

        function processIcon(icon: ImageResource) {
          const baseSrc = icon.src;
          if (!baseSrc) {
            api.logger.warn(
              formatLog(
                'Cannot precache web app manifest icon cause "src" is not defined',
              ),
            );
            return;
          }
          const src = (
            baseSrc.startsWith(assetPrefix)
              ? baseSrc.replace(assetPrefix, "")
              : baseSrc
          ).replace(/^\//, "");
          assetsToPrecache.push(src);
        }

        api.logger.debug(formatLog("Web app manifest icons are precached"));
      }

      const wbGlobPatterns = swConfig.include
        ? typeof swConfig.include === "function"
          ? swConfig.include(assetsToPrecache, initialAssetsToPrecache)
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
