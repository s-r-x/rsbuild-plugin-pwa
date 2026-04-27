import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import chalk from "chalk";
import type { OmitRequired } from "./type-utils.ts";
import type {
  PWAPluginOptions,
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
export const DEFAULT_REG_SW_CONFIG = {
  type: "script",
  scriptName: DEFAULT_REG_SW_FILENAME,
  injectPosition: DEFAULT_REG_SW_SCRIPT_INJ_POS,
  injectTarget: DEFAULT_REG_SW_SCRIPT_INJ_TAR,
  defer: DEFAULT_REG_SW_SCRIPT_INJ_DEFER,
  features: {
    autoReloadPage: false,
    autoSkipWaiting: false,
  },
} as const satisfies OmitRequired<RegisterSwScriptConfig, "scope">;

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

export const VM_MOD_BASE_NAME = "rsbuild-plugin-pwa_vm";
export const VM_LIST = [
  "preact",
  "react",
  "register-sw",
  "solid",
  "svelte",
  "vue",
] as const;
const dirname = path.dirname(fileURLToPath(import.meta.url));
export const VM_SRC_BASE_FOLDER = path.join(dirname, "vm");
export const VM_SRC_FOLDER_MOCK = path.join(VM_SRC_BASE_FOLDER, "mock");
export const VM_SRC_FOLDER = path.join(VM_SRC_BASE_FOLDER, "main");
export const VM_COMPILED_BASE_FOLDER = path.join(dirname, "..", "vm-dist");
export const VM_COMPILED_FOLDER = path.join(VM_COMPILED_BASE_FOLDER, "main");
export const VM_COMPILED_FOLDER_MOCK = path.join(
  VM_COMPILED_BASE_FOLDER,
  "mock",
);

export const REG_SW_SCRIPT_SRC_FOLDER = path.join(
  dirname,
  "register-sw-script",
);
export const REG_SW_SCRIPT_COMPILED_FOLDER = path.join(
  dirname,
  "..",
  "register-sw-script-dist",
);
