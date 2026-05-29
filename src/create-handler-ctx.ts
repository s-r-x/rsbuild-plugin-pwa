import type { RsbuildPluginAPI } from "@rsbuild/core";
import {
  DEFAULT_SW_FILENAME,
  DEFAULT_WEB_APP_MANIFEST_FILENAME,
} from "./config.ts";
import type {
  NormalizedPluginConfig,
  RsBuildActionHandlerCtx,
} from "./types-internal.ts";
import { readPluginPackageJson } from "./utils.ts";

export function createHandlerCtx({
  rsbuildApi: api,
  pluginConfig: cfg,
}: {
  rsbuildApi: RsbuildPluginAPI;
  pluginConfig: NormalizedPluginConfig;
}): RsBuildActionHandlerCtx {
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
  const pluginPkgJson = readPluginPackageJson()
  const handlerCtx: RsBuildActionHandlerCtx = {
    pluginPkgJson,
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
  return handlerCtx;
}
