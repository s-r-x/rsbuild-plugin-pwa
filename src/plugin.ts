import path from "node:path";
import type { HtmlBasicTag, RsbuildPlugin } from "@rsbuild/core";
import { DEFAULT_SW_FILENAME, LOG_PREFIX, PLUGIN_NAME } from "./config.ts";
import { genRegisterSwScript } from "./gen-register-sw-script.ts";
import { handleRsBuildBuildAction } from "./handle-rsbuild-build-action.ts";
import { handleRsBuildDevAction } from "./handle-rsbuild-dev-action.ts";
import { normalizePluginConfig } from "./normalize-plugin-config.ts";
import type { PWAPluginOptions } from "./types.ts";
import type { RsBuildActionHandlerCtx } from "./types-internal.ts";
import { genWebAppManifestUrl } from "./web-app-manifest-utils.ts";

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
    const cfg = normalizePluginConfig(baseCfg);
    if (typeof cfg.disabled === "boolean" && cfg.disabled) {
      api.logger.debug(LOG_PREFIX + "plugin is disabled");
      return;
    }

    const handlerCtx: RsBuildActionHandlerCtx = {
      rsbuildApi: api,
      pluginConfig: cfg,
      checkIfPluginDisabled({ environmentName }) {
        if (!cfg.disabled) return false;
        else if (typeof cfg.disabled === "function")
          return cfg.disabled({ environmentName });
        else return Boolean(cfg.disabled);
      },
      extractEnvBaseUrl(ctx) {
        return ctx.config.server.base || "/";
      },
    };
    if (api.context.action === "build") {
      handleCommonHooks();
      return handleRsBuildBuildAction(handlerCtx);
    } else if (api.context.action === "dev" && cfg.dev) {
      handleCommonHooks();
      return handleRsBuildDevAction(handlerCtx);
    } else {
      api.logger.debug(
        LOG_PREFIX + `skipping rsbuild action "${api.context.action}"`,
      );
    }
    function handleCommonHooks() {
      const swFilename = cfg.sw.filename || DEFAULT_SW_FILENAME;
      const registerSwCfg = cfg.registerSw;
      const webAppManifestCfg = cfg.webAppManifest;
      api.modifyHTMLTags(function modifyHtmlTags(tags, { environment }) {
        const baseUrl = environment.config.server.base || "/";
        if (
          handlerCtx.checkIfPluginDisabled({
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
              scope:
                registerSwCfg.scope ||
                (webAppManifestCfg !== false &&
                  webAppManifestCfg.content?.scope) ||
                baseUrl,
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
            registerSwCfg.injectTarget === "head"
              ? tags.headTags
              : tags.bodyTags;
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
              href: genWebAppManifestUrl({
                baseUrl,
                filename: webAppManifestCfg.filename,
              }),
            },
          });
          api.logger.debug(
            LOG_PREFIX + "link to web app manifest added to the html",
          );
        }
        return tags;
      });
    }
  },
});
