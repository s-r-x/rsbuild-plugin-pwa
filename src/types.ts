import type { WebAppManifest } from "web-app-manifest";
import type { GenerateSWOptions, InjectManifestOptions } from "workbox-build";

export type { WebAppManifest };

export interface WebAppManifestConfig {
  /**
   * @defaultValue "manifest.webmanifest"
   */
  filename?: string;
  content?: WebAppManifest;
  /**
   * Skip the <link rel="..."/> injection?
   */
  skipHtmlInjection?: boolean;
  minify?: boolean;
}

export type RegisterSwScriptInjectionTarget = "head" | "body";
export type RegisterSwScriptInjectionPosition = "start" | "end";

export interface RegisterSwSharedConfig {
  /**
   * overrides built-in registration events
   */
  events?: Partial<RegisterSwEvents>;
  /**
   * @defaultValue "head"
   */
  injectTarget?: RegisterSwScriptInjectionTarget;
  /**
   * @defaultValue "end"
   */
  injectPosition?: RegisterSwScriptInjectionPosition;
}

export interface RegisterSwInlineConfig extends RegisterSwSharedConfig {
  type: "inline";
}
export interface RegisterSwScriptConfig extends RegisterSwSharedConfig {
  type: "script";
  /**
   * @defaultValue "register-sw.js"
   */
  scriptName?: string;
  /**
   * @defaultValue true
   */
  defer?: boolean;
}

export type WorkboxGenerateSWOptions = Omit<
  GenerateSWOptions,
  "globDirectory" | "swDest" | "globPatterns" | "modifyURLPrefix"
>;
export type WorkboxInjectManifestOptions = Omit<
  InjectManifestOptions,
  "globDirectory" | "globPatterns" | "modifyURLPrefix"
>;

export interface SharedSwConfig {
  /**
   * @defaultValue "sw.js"
   */
  filename?: string;
  /**
   * This array will be passed to workbox globPatterns.
   * By default all assets bundled by rsbuild are included plus sw registration script and web app manifest
   * @example
   * ```ts
   * ["**\/*.{js,wasm,css,html}"]
   * ```
   * @example
   * ```ts
   * (assets) => [...assets.map(asset => asset), "**\/*.{ico,svg,png}"]
   * ```
   */
  include?: string[] | ((assets: string[]) => string[]);
}
export interface GenerateSwModeConfig extends SharedSwConfig {
  mode: "generateSw";
  workboxOptions?: WorkboxGenerateSWOptions;
}
export interface InjectManifestModeConfig extends SharedSwConfig {
  mode: "injectManifest";
  /**
   * path to your sw relative to the project root
   * @example
   * ```ts
   * path.join("src", "my-sw.js")
   * ```
   * @example
   * ```ts
   * "/home/user/my-project/src/sw.ts"
   * ```
   */
  srcFile: string;
  minify?: boolean;
  workboxOptions?: WorkboxInjectManifestOptions;
}
export type ServiceWorkerConfig =
  | GenerateSwModeConfig
  | InjectManifestModeConfig;
export type RegisterSwConfig = RegisterSwInlineConfig | RegisterSwScriptConfig;
export interface RegisterSwEvents {
  /**
   * SW has been registered
   */
  registered: string;
  /**
   * First install. The app is ready to work offline
   */
  offlineReady: string;
  /**
   * Something went wrong during SW registration
   */
  registerError: string;
  /**
   * A new SW has been detected but the old one is still active. You may ask the user to reload the page
   * ```ts
   * window.addEventListener("rsbuild-plugin-pwa:waiting-refresh", function () {
   *   if (
   *     window.confirm("A new version of the app is available. Reload the page?")
   *   ) {
   *     window.location.reload();
   *   }
   * });
   * ```
   */
  waitingRefresh: string;
}

export interface PWAPluginOptions {
  sw?: ServiceWorkerConfig;
  /**
   * false to disable
   * @defaultValue {@link RegisterSwScriptConfig}
   */
  registerSw?: RegisterSwConfig | false;
  /**
   * false to disable
   */
  webAppManifest?: WebAppManifestConfig | false;
  /**
   * Disable the plugin?
   * By default the plugin is disabled if the environment is not "web"
   * @example
   * ```ts
   * ({environmentName}) => environmentName !== "web"
   * ```
   */
  disabled?: boolean | ((ctx: { environmentName: string }) => boolean);
}
