
declare module "rsbuild-plugin-pwa_vm/react" {
  export type RegisterSWOptions =
    import("../vm-dist/main/react").RegisterSWOptions;
  export type RegisterSWReturnValue =
    import("../vm-dist/main/react").UseRegisterSWReturnValue;

  export const useRegisterSW: typeof import("../vm-dist/main/react").useRegisterSW;
}
