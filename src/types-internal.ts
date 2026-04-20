import type { EnvironmentContext, RsbuildPluginAPI } from "@rsbuild/core";
import type { NormalizedRegisterSwConfig } from "./normalize-register-sw-cfg.ts";
import type { SetRequired } from "./type-utils.ts";
import type { PWAPluginOptions } from "./types.ts";

export interface NormalizedPluginConfig
  extends Omit<
    SetRequired<PWAPluginOptions, "disabled" | "dev" | "sw" | "webAppManifest">,
    "registerSw"
  > {
  registerSw: NormalizedRegisterSwConfig;
}

export interface RsBuildActionHandlerCtx {
  rsbuildApi: RsbuildPluginAPI;
  pluginConfig: NormalizedPluginConfig;
  checkIfPluginDisabled: (args: { environmentName: string }) => boolean;
  extractEnvBaseUrl: (ctx: EnvironmentContext) => string;
  genSwUrl: (args: { baseUrl: string }) => string;
  genSwScope: (args: { baseUrl: string }) => string;
}
