import {
  DEFAULT_DISABLE_PLUGIN,
  DEFAULT_ENABLE_PLUGIN_IN_DEV,
  DEFAULT_SW_CONFIG,
} from "./config.ts";
import { normalizeRegisterSwCfg } from "./normalize-register-sw-cfg.ts";
import type { PWAPluginOptions } from "./types.ts";
import type { NormalizedPluginConfig } from "./types-internal.ts";

export function normalizePluginConfig(
  baseConfig: PWAPluginOptions,
): NormalizedPluginConfig {
  const {
    disabled = DEFAULT_DISABLE_PLUGIN,
    webAppManifest: webAppManifestCfg = {},
    sw: swConfig = DEFAULT_SW_CONFIG,
    registerSw: baseRegisterSwCfg,
    dev = DEFAULT_ENABLE_PLUGIN_IN_DEV,
    ...rest
  } = baseConfig;
  return {
    dev,
    disabled,
    webAppManifest: webAppManifestCfg,
    sw: swConfig,
    registerSw: normalizeRegisterSwCfg(baseRegisterSwCfg),
    ...rest,
  };
}
