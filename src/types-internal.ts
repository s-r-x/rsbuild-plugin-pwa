import type { EnvironmentContext, RsbuildPluginAPI } from "@rsbuild/core";
import type { NormalizedRegisterSwConfig } from "./normalize-register-sw-cfg.ts";
import type { SetRequired } from "./type-utils.ts";
import type { PWAPluginOptions } from "./types.ts";

export interface NormalizedPluginConfig extends Omit<
  SetRequired<PWAPluginOptions, "disabled" | "dev" | "sw" | "webAppManifest">,
  "registerSw"
> {
  registerSw: NormalizedRegisterSwConfig;
}

export interface RsBuildActionHandlerCtx {
  rsbuildApi: RsbuildPluginAPI;
  pluginConfig: NormalizedPluginConfig;
  pluginPkgJson: PackageJson | null;
  checkIfPluginDisabled: (args: { environmentName: string }) => boolean;
  extractAssetPrefix: (env: EnvironmentContext | null) => string;
  extractEnvBaseUrl: (env: EnvironmentContext | null) => string;
  normalizeAssetUrl: (args: {
    environment: EnvironmentContext | null;
    asset: string;
  }) => string;
  genSwUrl: (args: { environment: EnvironmentContext | null }) => string;
  genWebAppManifestUrl: (args: {
    environment: EnvironmentContext | null;
    filename?: string;
  }) => string;
  genSwScope: (args: { baseUrl: string }) => string;
}

export type PackageJson = {
  version: string;
  name?: string;
  description?: string;
};
