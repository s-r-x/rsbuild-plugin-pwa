
declare module "rsbuild-plugin-pwa_vm/vue" {
  export type RegisterSWOptions =
    import("../vm-dist/main/vue").RegisterSWOptions;
  export type RegisterSWReturnValue =
    import("../vm-dist/main/vue").UseRegisterSWReturnValue;

  export const useRegisterSW: typeof import("../vm-dist/main/vue").useRegisterSW;
}
