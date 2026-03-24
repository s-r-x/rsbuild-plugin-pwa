import fs from "node:fs/promises";
import path from "node:path";
import type {
  EnvironmentContext,
  HtmlBasicTag,
  RsbuildPlugin,
} from "@rsbuild/core";
import chalk from "chalk";
import { generateSW, injectManifest } from "workbox-build";
import { buildCustomSw } from "./build-custom-sw.ts";
import {
  DEFAULT_DISABLE_PLUGIN,
  DEFAULT_SW_CONFIG,
  DEFAULT_SW_FILENAME,
  DEFAULT_WEB_APP_MANIFEST_FILENAME,
  DEFAULT_WORKBOX_BUILD_VALUES,
  LOG_PREFIX,
  PLUGIN_NAME,
} from "./config.ts";
import { genRegisterSwScript } from "./gen-register-sw-script.ts";
import { normalizeRegisterSwCfg } from "./normalize-register-sw-cfg.ts";
import { normalizeWebAppManifest } from "./normalize-web-app-manifest.ts";
import type { PWAPluginOptions } from "./types.ts";
import { formatMs } from "./utils.ts";

/**
 * @example
 * ```ts
 * // rsbuild.config.ts
 * import {defineConfig} from "@rsbuild/core";
 * import {pluginPWA} from "rsbuild-plugin-pwa";
 * export default defineConfig({
 *   plugins: [pluginPWA()]
 * });
 * ```
 */
export const pluginPWA = ({
  disabled = DEFAULT_DISABLE_PLUGIN,
  webAppManifest: webAppManifestCfg = {},
  sw: swConfig = DEFAULT_SW_CONFIG,
  registerSw: baseRegisterSwCfg,
}: PWAPluginOptions = {}): RsbuildPlugin => ({
  name: PLUGIN_NAME,
  setup(api) {
    if (api.context.action !== "build") {
      api.logger.debug(
        LOG_PREFIX + `skipping rsbuild action "${api.context.action}"`,
      );
      return;
    }
    if (typeof disabled === "boolean" && disabled) {
      api.logger.debug(LOG_PREFIX + "plugin is disabled");
      return;
    }
    const swFilename = swConfig.filename || DEFAULT_SW_FILENAME;
    const registerSwCfg = normalizeRegisterSwCfg(baseRegisterSwCfg);
    const webAppManifest = webAppManifestCfg
      ? webAppManifestCfg.content || {}
      : {};

    api.modifyHTMLTags(function modifyHtmlTags(tags, { environment }) {
      const baseUrl = extractEnvBaseUrl(environment);
      if (
        checkIfPluginDisabled({
          environmentName: environment.name,
        })
      ) {
        return tags;
      }
      if (registerSwCfg) {
        const registerSwTag: HtmlBasicTag = {
          tag: "script",
        };
        if (registerSwCfg.type === "inline") {
          registerSwTag.children = genRegisterSwScript({
            baseUrl,
            scope: webAppManifest.scope || baseUrl,
            swFilename,
            events: registerSwCfg.events,
          });
        } else {
          registerSwTag.attrs = {
            defer: registerSwCfg.defer,
            src: path.posix.join(baseUrl, registerSwCfg.scriptName),
          };
        }
        const tagsToMutate =
          registerSwCfg.injectTarget === "head" ? tags.headTags : tags.bodyTags;
        if (registerSwCfg.injectPosition === "start") {
          tagsToMutate.unshift(registerSwTag);
        } else {
          tagsToMutate.push(registerSwTag);
        }
        api.logger.debug(LOG_PREFIX + "register sw script added to the html");
      }
      if (webAppManifestCfg && !webAppManifestCfg.skipHtmlInjection) {
        tags.headTags.unshift({
          tag: "link",
          attrs: {
            rel: "manifest",
            href: path.posix.join(
              baseUrl,
              webAppManifestCfg.filename || DEFAULT_WEB_APP_MANIFEST_FILENAME,
            ),
          },
        });
        api.logger.debug(
          LOG_PREFIX + "link to web app manifest added to the html",
        );
      }
      return tags;
    });
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
              scope: webAppManifest.scope || baseUrl,
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
            JSON.stringify(
              manifest,
              null,
              webAppManifestCfg.minify ? undefined : 2,
            ),
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
        const wbModifyUrlPrefix = {
          // prepend baseUrl to every url
          "": baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`,
        };
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
          const swSrcBase = swConfig.srcFile;
          const rsbuildResult = await buildCustomSw({
            rootFolder,
            swSrc: path.isAbsolute(swSrcBase)
              ? swSrcBase
              : path.resolve(rootFolder, swSrcBase),
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

    function extractEnvBaseUrl(ctx: EnvironmentContext): string {
      return ctx.config.server.base;
    }
    function checkIfPluginDisabled({
      environmentName,
    }: {
      environmentName: string;
    }): boolean {
      if (!disabled) return false;
      else if (typeof disabled === "function")
        return disabled({ environmentName });
      else return Boolean(disabled);
    }
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
  },
});
