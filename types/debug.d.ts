
declare module "rsbuild-plugin-pwa_vm/debug" {
  export const getPluginVersion: typeof import("../vm-dist/main/debug").getPluginVersion;
  export const getBuildDate: typeof import("../vm-dist/main/debug").getBuildDate;
  export const getSwUrl: typeof import("../vm-dist/main/debug").getSwUrl;
  export const getSwScope: typeof import("../vm-dist/main/debug").getSwScope;
  export const getBaseUrl: typeof import("../vm-dist/main/debug").getBaseUrl;
  export const getCustomDebugValues: typeof import("../vm-dist/main/debug").getCustomDebugValues;
  export const printDebugValues: typeof import("../vm-dist/main/debug").printDebugValues;
}
