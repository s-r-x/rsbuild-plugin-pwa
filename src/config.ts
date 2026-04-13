import os from "node:os";
import path from "node:path";
import chalk from "chalk";
import type { OmitRequired } from "./type-utils.ts";
import type {
  PWAPluginOptions,
  RegisterSwEvents,
  RegisterSwScriptConfig,
  RegisterSwScriptInjectionPosition,
  RegisterSwScriptInjectionTarget,
  ServiceWorkerConfig,
} from "./types.ts";

export const PLUGIN_NAME = "rsbuild:pwa";
export const LOG_PREFIX = chalk.magenta("pwa") + ": ";

export const DEFAULT_WEB_APP_MANIFEST_FILENAME = "manifest.webmanifest";
export const DEFAULT_WEB_APP_MANIFEST_NAME = "App";

export const DEFAULT_SW_FILENAME = "sw.js";

export const DEFAULT_REG_SW_FILENAME = "register-sw.js";
export const DEFAULT_REG_SW_SCRIPT_INJ_POS: RegisterSwScriptInjectionPosition =
  "end";
export const DEFAULT_REG_SW_SCRIPT_INJ_TAR: RegisterSwScriptInjectionTarget =
  "head";
export const DEFAULT_REG_SW_SCRIPT_INJ_DEFER = true;
const REG_SW_EVENT_PREFIX = "rsbuild-plugin-pwa:";
export const DEFAULT_REG_SW_EVENTS = {
  registered: `${REG_SW_EVENT_PREFIX}registered`,
  registerError: `${REG_SW_EVENT_PREFIX}register-error`,
  offlineReady: `${REG_SW_EVENT_PREFIX}offline-ready`,
  waitingRefresh: `${REG_SW_EVENT_PREFIX}waiting-refresh`,
} as const satisfies RegisterSwEvents;
export const DEFAULT_REG_SW_CONFIG = {
  type: "script",
  scriptName: DEFAULT_REG_SW_FILENAME,
  injectPosition: DEFAULT_REG_SW_SCRIPT_INJ_POS,
  injectTarget: DEFAULT_REG_SW_SCRIPT_INJ_TAR,
  defer: DEFAULT_REG_SW_SCRIPT_INJ_DEFER,
  events: DEFAULT_REG_SW_EVENTS,
} as const satisfies OmitRequired<Required<RegisterSwScriptConfig>, "scope">;

export const DEFAULT_WORKBOX_BUILD_VALUES = {
  inlineWorkboxRuntime: true,
  globIgnores: ["**/*.map"],
  cleanupOutdatedCaches: true,
};

export const DEFAULT_SW_CONFIG: ServiceWorkerConfig = {
  mode: "generateSw",
  filename: DEFAULT_SW_FILENAME,
};

export const DEFAULT_DISABLE_PLUGIN: NonNullable<
  PWAPluginOptions["disabled"]
> = ({ environmentName }) => environmentName !== "web";

export const DEFAULT_ENABLE_PLUGIN_IN_DEV = false;
export const DEV_GENERATE_SW_GLOB_FOLDER = path.join(
  os.tmpdir(),
  "rsbuild-plugin-pwa-gen-sw-dev-glob-dir",
);
export const DEV_SUPPRESS_WORKBOX_WARNINGS_FILENAME =
  "suppress-workbox-build-warnings.js";
export const DEV_SUPPRESS_WORKBOX_WARNINGS_CONTENT =
  "const meaningOfLine = '42';";
