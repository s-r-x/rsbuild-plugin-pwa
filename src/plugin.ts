import fs from "node:fs/promises";
import path from "node:path";
import type { HtmlBasicTag, RsbuildPlugin } from "@rsbuild/core";
import {
  DEFAULT_SW_FILENAME,
  DEFAULT_WEB_APP_MANIFEST_FILENAME,
  PLUGIN_NAME,
  VM_COMPILED_FOLDER,
  VM_COMPILED_FOLDER_MOCK,
  VM_LIST,
  VM_MOD_BASE_NAME,
} from "./config.ts";
import { genRegisterSwScript } from "./gen-register-sw-script.ts";
import { handleRsBuildBuildAction } from "./handle-rsbuild-build-action.ts";
import { handleRsBuildDevAction } from "./handle-rsbuild-dev-action.ts";
import { normalizePluginConfig } from "./normalize-plugin-config.ts";
import type { PWAPluginOptions } from "./types.ts";
import type { RsBuildActionHandlerCtx } from "./types-internal.ts";
import { formatLog } from "./utils.ts";

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
export const pluginPWA = (baseCfg: PWAPluginOptions = {}): RsbuildPlugin => ({
  name: PLUGIN_NAME,
  setup(api) {
    if (api.context.action === "preview") {
      return;
    }

    const cfg = normalizePluginConfig(baseCfg);

    if (typeof cfg.disabled === "boolean" && cfg.disabled) {
      api.logger.debug(formatLog("plugin is disabled"));
      return;
    }

    const extractEnvBaseUrl: RsBuildActionHandlerCtx["extractEnvBaseUrl"] =
      function (env) {
        return env?.config.server.base || "/";
      };
    const extractAssetPrefix: RsBuildActionHandlerCtx["extractAssetPrefix"] =
      function (env) {
        let prefix: string;
        const assetPrefix = env?.config.output.assetPrefix;
        const baseUrl = extractEnvBaseUrl(env);
        if (api.context.action !== "build") {
          prefix = baseUrl;
        } else {
          // TODO:: support "auto"
          if (assetPrefix && assetPrefix !== "auto") {
            prefix = assetPrefix;
          } else {
            prefix = baseUrl;
          }
        }
        return prefix.replace(/\/$/, "");
      };
    const normalizeAssetUrl: RsBuildActionHandlerCtx["normalizeAssetUrl"] =
      function ({ environment, asset }) {
        const assetPrefix = extractAssetPrefix(environment);
        return assetPrefix + "/" + asset.replace(/^\//, "");
      };
    const genWebAppManifestUrl: RsBuildActionHandlerCtx["genWebAppManifestUrl"] =
      function ({ environment, filename = DEFAULT_WEB_APP_MANIFEST_FILENAME }) {
        return normalizeAssetUrl({ environment, asset: filename });
      };
    const genSwScope: RsBuildActionHandlerCtx["genSwScope"] = function ({
      baseUrl,
    }) {
      if (cfg.registerSw?.scope) return cfg.registerSw.scope;
      const webAppManifestScope =
        cfg.webAppManifest !== false && cfg.webAppManifest.content?.scope;
      if (webAppManifestScope) return webAppManifestScope;
      return baseUrl.endsWith("/") ? baseUrl : baseUrl + "/";
    };
    const genSwUrl: RsBuildActionHandlerCtx["genSwUrl"] = function ({
      environment,
    }) {
      return normalizeAssetUrl({
        environment,
        asset: cfg.sw.filename || DEFAULT_SW_FILENAME,
      });
    };
    const handlerCtx: RsBuildActionHandlerCtx = {
      rsbuildApi: api,
      pluginConfig: cfg,
      extractEnvBaseUrl,
      extractAssetPrefix,
      normalizeAssetUrl,
      genWebAppManifestUrl,
      genSwScope,
      genSwUrl,
      checkIfPluginDisabled({ environmentName }) {
        if (!cfg.disabled) return false;
        else if (typeof cfg.disabled === "function")
          return cfg.disabled({ environmentName });
        else return Boolean(cfg.disabled);
      },
    };

    if (cfg.registerSw?.type === "virtual-module") {
      // bootstrap virtual modules even if it's dev and the plugin is disabled
      // to prevent runtime errors due to missing imports
      initVirtualModules();
    }

    if (api.context.action === "build") {
      handleCommonHooks();
      return handleRsBuildBuildAction(handlerCtx);
    } else if (api.context.action === "dev" && cfg.dev) {
      handleCommonHooks();
      return handleRsBuildDevAction(handlerCtx);
    } else {
      api.logger.debug(
        formatLog(`skipping rsbuild action "${api.context.action}"`),
      );
    }

    function handleCommonHooks() {
      api.modifyHTMLTags(async function modifyHtmlTags(tags, { environment }) {
        if (
          handlerCtx.checkIfPluginDisabled({
            environmentName: environment.name,
          })
        ) {
          return tags;
        }

        const webAppManifestCfg = cfg.webAppManifest;
        const registerSwCfg = cfg.registerSw;
        const baseUrl = handlerCtx.extractEnvBaseUrl(environment);

        if (registerSwCfg && registerSwCfg.type !== "virtual-module") {
          const registerSwTag: HtmlBasicTag = {
            tag: "script",
          };
          if (registerSwCfg.type === "inline") {
            registerSwTag.children = await genRegisterSwScript({
              swUrl: handlerCtx.genSwUrl({ environment }),
              scope: handlerCtx.genSwScope({ baseUrl }),
            });
          } else if (registerSwCfg.type === "script") {
            registerSwTag.attrs = {
              defer: registerSwCfg.defer,
              src: handlerCtx.normalizeAssetUrl({
                environment,
                asset: registerSwCfg.scriptName,
              }),
            };
          }
          const tagsToMutate =
            registerSwCfg.injectTarget === "head"
              ? tags.headTags
              : tags.bodyTags;
          if (registerSwCfg.injectPosition === "start") {
            tagsToMutate.unshift(registerSwTag);
          } else {
            tagsToMutate.push(registerSwTag);
          }
          api.logger.debug(formatLog("register sw script added to the html"));
        }

        if (webAppManifestCfg && !webAppManifestCfg.skipHtmlInjection) {
          tags.headTags.unshift({
            tag: "link",
            attrs: {
              rel: "manifest",
              href: handlerCtx.genWebAppManifestUrl({
                environment,
                filename: webAppManifestCfg.filename,
              }),
            },
          });
          api.logger.debug(
            formatLog("link to web app manifest added to the html"),
          );
        }

        return tags;
      });
    }

    function initVirtualModules() {
      // rspack vm plugin doesn't work out of the box
      // 1. we need to initialize rspack vm plugin with a map in format { fake path -> empty string (or something else, it doesn't matter, cause they're ignored anyway) }
      // 2. update rspack resolve aliases with a map { import name (e.g. rsbuild-plugin-pwa-virtual/register-sw) -> fake path }
      // 3. intercept those fake paths imports using api.transform and return the real module's code from there

      const vmPluginEntries: Record<string, string> = {};
      const rspackResolveAliasEntries: Record<string, string> = {};
      for (const moduleName of VM_LIST) {
        const importName = VM_MOD_BASE_NAME + "/" + moduleName;
        const realPath = path.join(
          api.context.action === "dev" && !cfg.dev
            ? VM_COMPILED_FOLDER_MOCK
            : VM_COMPILED_FOLDER,
          moduleName + ".js",
        );
        const fakePath = path.join(
          path.join(api.context.rootPath, ".rsbuild-pwa-virtual-module"),
          VM_MOD_BASE_NAME + "/" + moduleName + ".js",
        );
        vmPluginEntries[fakePath] = "";
        rspackResolveAliasEntries[importName] = fakePath;
        // it looks like this transform thing works only when called synchronously in "setup" cb
        // cause it does nothing inside modifyRspackConfig cb
        api.transform(
          {
            test: fakePath,
          },
          async function transformVirtualModule(ctx) {
            const content = await fs.readFile(realPath, "utf8");
            return content.replace(/__SW_URL|__SW_SCOPE/g, function (match) {
              const baseUrl = handlerCtx.extractEnvBaseUrl(ctx.environment);
              switch (match) {
                case "__SW_URL":
                  return handlerCtx.genSwUrl({ environment: ctx.environment });
                case "__SW_SCOPE":
                  return handlerCtx.genSwScope({ baseUrl });
                default:
                  return match;
              }
            });
          },
        );
      }

      api.modifyRspackConfig(function modifyRspackCfg(rspackCfg, utils) {
        if (
          handlerCtx.checkIfPluginDisabled({
            environmentName: utils.environment.name,
          })
        ) {
          return;
        }

        rspackCfg.plugins.push(
          new utils.rspack.experiments.VirtualModulesPlugin(vmPluginEntries),
        );
        const newRspackCfg = utils.mergeConfig(rspackCfg, {
          resolve: {
            alias: rspackResolveAliasEntries,
          },
        });
        api.logger.debug(formatLog("virtual modules initialized"));
        return newRspackCfg;
      });
    }
  },
});
