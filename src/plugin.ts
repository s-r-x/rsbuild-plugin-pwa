import type { RsbuildPlugin } from "@rsbuild/core";
import { PLUGIN_NAME } from "./config.ts";
import { createHandlerCtx } from "./create-handler-ctx.ts";
import { handleHtmlInjection } from "./handle-html-injection.ts";
import { handleRsBuildBuildAction } from "./handle-rsbuild-build-action.ts";
import { handleRsBuildDevAction } from "./handle-rsbuild-dev-action.ts";
import { handleVirtualModules } from "./handle-vm.ts";
import { normalizePluginConfig } from "./normalize-plugin-config.ts";
import type { PWAPluginOptions } from "./types.ts";
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

    const handlerCtx = createHandlerCtx({ rsbuildApi: api, pluginConfig: cfg });

    if (cfg.registerSw?.type === "virtual-module") {
      // bootstrap virtual modules even if it's dev and the plugin is disabled
      // to prevent runtime errors due to missing imports
      handleVirtualModules(handlerCtx);
    }

    const shouldHandleBuild = api.context.action === "build";
    const shouldHandleDev = api.context.action === "dev" && cfg.dev;
    if (shouldHandleBuild || shouldHandleDev) {
      handleHtmlInjection(handlerCtx);
    }
    if (shouldHandleBuild) {
      handleRsBuildBuildAction(handlerCtx);
    } else if (shouldHandleDev) {
      handleRsBuildDevAction(handlerCtx);
    } else {
      api.logger.debug(
        formatLog(`skipping rsbuild action "${api.context.action}"`),
      );
    }
  },
});
