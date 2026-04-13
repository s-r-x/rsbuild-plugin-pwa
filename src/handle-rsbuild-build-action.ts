import fs from "node:fs/promises";
import path from "node:path";
import chalk from "chalk";
import { generateSW, injectManifest } from "workbox-build";
import { buildCustomSw } from "./build-custom-sw.ts";
import {
  DEFAULT_SW_FILENAME,
  DEFAULT_WEB_APP_MANIFEST_FILENAME,
  DEFAULT_WORKBOX_BUILD_VALUES,
  LOG_PREFIX,
} from "./config.ts";
import { genRegisterSwScript } from "./gen-register-sw-script.ts";
import type { RsBuildActionHandlerCtx } from "./types-internal.ts";
import { formatMs } from "./utils.ts";
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
}: RsBuildActionHandlerCtx) {
  const swFilename = swConfig.filename || DEFAULT_SW_FILENAME;
  const webAppManifest = webAppManifestCfg
    ? webAppManifestCfg.content || {}
    : {};

  api.onAfterEnvironmentCompile(
    async function handleEnvironmentCompilation(opts) {
      const baseUrl = extractEnvBaseUrl(opts.environment);
      const rootFolder = api.context.rootPath;
      const environmentName = opts.environment.name;
      if (checkIfPluginDisabled({ environmentName })) {
        api.logger.debug(LOG_PREFIX + "plugin is disabled");
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

      api.logger.start(LOG_PREFIX + "generating...");
      const buildStartedAt = performance.now();

      const assetsToPrecache = (assets || []).reduce((acc, asset) => {
        if (asset.name && !asset.name.endsWith(".map")) {
          acc.push(asset.name);
        }
        return acc;
      }, [] as string[]);
      if (registerSwCfg?.type === "script") {
        await fs.writeFile(
          path.resolve(outputPath, registerSwCfg.scriptName),
          genRegisterSwScript({
            baseUrl,
            scope: registerSwCfg.scope || webAppManifest.scope || baseUrl,
            swFilename,
            events: registerSwCfg.events,
          }),
        );
        api.logger.debug(LOG_PREFIX + "register sw script generated");
        assetsToPrecache.push(registerSwCfg.scriptName);
      }

      if (webAppManifestCfg) {
        const manifest = await normalizeWebAppManifest(
          webAppManifestCfg.content,
          { baseUrl },
        );
        const name =
          webAppManifestCfg.filename || DEFAULT_WEB_APP_MANIFEST_FILENAME;
        await fs.writeFile(
          path.resolve(outputPath, name),
          serializeWebAppManifest(manifest, webAppManifestCfg.minify),
        );
        api.logger.debug(LOG_PREFIX + "web app manifest generated");
        assetsToPrecache.push(name);
      } else {
        api.logger.debug(LOG_PREFIX + "skipping web app manifest generation");
      }

      const wbGlobPatterns = swConfig.include
        ? typeof swConfig.include === "function"
          ? swConfig.include(assetsToPrecache)
          : swConfig.include
        : assetsToPrecache;
      const wbModifyUrlPrefix = genWbModifyUrlPrefix(baseUrl);
      if (swConfig.mode === "generateSw") {
        const {
          globIgnores = DEFAULT_WORKBOX_BUILD_VALUES.globIgnores,
          inlineWorkboxRuntime = DEFAULT_WORKBOX_BUILD_VALUES.inlineWorkboxRuntime,
          cleanupOutdatedCaches = DEFAULT_WORKBOX_BUILD_VALUES.cleanupOutdatedCaches,
          ...workboxOpts
        } = swConfig.workboxOptions || {};
        let sourcemap = workboxOpts.sourcemap;
        if (typeof sourcemap !== "boolean") {
          const rsbuildSourcemap = opts.environment.config.output.sourceMap;
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
          modifyURLPrefix: wbModifyUrlPrefix,
        });

        const buildTime = performance.now() - buildStartedAt;
        if (buildResult.warnings?.length) {
          api.logger.warn(LOG_PREFIX + buildResult.warnings.join("\n"));
        }
        printSuccessMessage({ buildTime, precachedCount: buildResult.count });
      } else if (swConfig.mode === "injectManifest") {
        const {
          globIgnores = DEFAULT_WORKBOX_BUILD_VALUES.globIgnores,
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
          modifyURLPrefix: wbModifyUrlPrefix,
        });

        // buildCustomSw cleanup
        await fs.rm(rsbuildResult.destDir, { recursive: true, force: true });

        const buildTime = performance.now() - buildStartedAt;
        if (wbBuildResult.warnings?.length) {
          api.logger.warn(LOG_PREFIX + wbBuildResult.warnings.join("\n"));
        }
        printSuccessMessage({
          buildTime,
          precachedCount: wbBuildResult.count,
        });
      } else {
        api.logger.error(LOG_PREFIX + "Unknown SW mode");
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
    api.logger.success(LOG_PREFIX + successMessage);
  }
}
