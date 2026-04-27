import {
  DEFAULT_REG_SW_CONFIG,
  DEFAULT_REG_SW_FILENAME,
  DEFAULT_REG_SW_SCRIPT_INJ_DEFER,
  DEFAULT_REG_SW_SCRIPT_INJ_POS,
  DEFAULT_REG_SW_SCRIPT_INJ_TAR,
} from "./config.ts";
import type { OmitRequired } from "./type-utils.ts";
import type {
  DefaultRegisterSwScriptFeatures,
  RegisterSwConfig,
  RegisterSwInlineConfig,
  RegisterSwScriptConfig,
  RegisterSwVirtualModuleConfig,
} from "./types.ts";

export type NormalizedRegisterSwConfig =
  | OmitRequired<RegisterSwInlineConfig, "scope">
  | OmitRequired<RegisterSwScriptConfig, "scope">
  | OmitRequired<RegisterSwVirtualModuleConfig, "scope">
  | null;
export function normalizeRegisterSwCfg(
  baseRegisterSwCfg?: RegisterSwConfig | false,
): NormalizedRegisterSwConfig {
  if (typeof baseRegisterSwCfg === "undefined") {
    return DEFAULT_REG_SW_CONFIG;
  } else if (baseRegisterSwCfg === false) {
    return null;
  } else if (baseRegisterSwCfg.type === "inline") {
    const {
      injectPosition = DEFAULT_REG_SW_SCRIPT_INJ_POS,
      injectTarget = DEFAULT_REG_SW_SCRIPT_INJ_TAR,
      features,
      ...rest
    } = baseRegisterSwCfg;
    return {
      injectPosition,
      injectTarget,
      features: normalizeDefaultRegisterSwFeatures(features),
      ...rest,
    };
  } else if (baseRegisterSwCfg.type === "script") {
    const {
      scriptName,
      injectPosition = DEFAULT_REG_SW_SCRIPT_INJ_POS,
      injectTarget = DEFAULT_REG_SW_SCRIPT_INJ_TAR,
      defer = DEFAULT_REG_SW_SCRIPT_INJ_DEFER,
      features,
      ...rest
    } = baseRegisterSwCfg;
    return {
      scriptName: scriptName || DEFAULT_REG_SW_FILENAME,
      injectPosition,
      injectTarget,
      defer,
      features: normalizeDefaultRegisterSwFeatures(features),
      ...rest,
    };
  } else if (baseRegisterSwCfg.type === "virtual-module") {
    return baseRegisterSwCfg;
  } else {
    throw new Error("invalid registerSw config");
  }
}
function normalizeDefaultRegisterSwFeatures(
  features?: DefaultRegisterSwScriptFeatures,
): Required<DefaultRegisterSwScriptFeatures> {
  return {
    autoSkipWaiting: features?.autoSkipWaiting ?? false,
    autoReloadPage:
      features?.autoReloadPage ?? Boolean(features?.autoSkipWaiting),
  };
}
