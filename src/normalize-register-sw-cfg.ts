import {
  DEFAULT_REG_SW_CONFIG,
  DEFAULT_REG_SW_EVENTS,
  DEFAULT_REG_SW_FILENAME,
  DEFAULT_REG_SW_SCRIPT_INJ_DEFER,
  DEFAULT_REG_SW_SCRIPT_INJ_POS,
  DEFAULT_REG_SW_SCRIPT_INJ_TAR,
} from "./config.ts";
import type {
  RegisterSwConfig,
  RegisterSwInlineConfig,
  RegisterSwScriptConfig,
} from "./types.ts";

export type NormalizedRegisterSwConfig =
  | Required<RegisterSwInlineConfig>
  | Required<RegisterSwScriptConfig>
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
      type,
      injectPosition = DEFAULT_REG_SW_SCRIPT_INJ_POS,
      injectTarget = DEFAULT_REG_SW_SCRIPT_INJ_TAR,
      events = DEFAULT_REG_SW_EVENTS,
    } = baseRegisterSwCfg;
    return {
      type,
      injectPosition,
      injectTarget,
      events,
    };
  } else if (baseRegisterSwCfg.type === "script") {
    const {
      type,
      scriptName = DEFAULT_REG_SW_FILENAME,
      injectPosition = DEFAULT_REG_SW_SCRIPT_INJ_POS,
      injectTarget = DEFAULT_REG_SW_SCRIPT_INJ_TAR,
      defer = DEFAULT_REG_SW_SCRIPT_INJ_DEFER,
      events = DEFAULT_REG_SW_EVENTS,
    } = baseRegisterSwCfg;
    return {
      type,
      scriptName,
      injectPosition,
      injectTarget,
      defer,
      events,
    };
  } else {
    throw new Error("invalid registerSw config");
  }
}
