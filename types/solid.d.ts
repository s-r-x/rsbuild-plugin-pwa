
declare module "rsbuild-plugin-pwa_vm/solid" {
  export type RegisterSWOptions =
    import("../vm-dist/main/solid").RegisterSWOptions;
  export type RegisterSWReturnValue =
    import("../vm-dist/main/solid").UseRegisterSWReturnValue;

  export const useRegisterSW: typeof import("../vm-dist/main/solid").useRegisterSW;
}
