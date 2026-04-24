
declare module "rsbuild-plugin-pwa_vm/preact" {
  export type RegisterSWOptions =
    import("../vm-dist/main/preact").RegisterSWOptions;
  export type RegisterSWReturnValue =
    import("../vm-dist/main/preact").UseRegisterSWReturnValue;

  export const useRegisterSW: typeof import("../vm-dist/main/preact").useRegisterSW;
}
