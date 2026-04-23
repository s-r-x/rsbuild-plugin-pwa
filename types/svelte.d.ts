
declare module "rsbuild-plugin-pwa_vm/svelte" {
  export type RegisterSWOptions =
    import("../vm-dist/main/svelte").RegisterSWOptions;
  export type RegisterSWReturnValue =
    import("../vm-dist/main/svelte").UseRegisterSWReturnValue;

  export const useRegisterSW: typeof import("../vm-dist/main/svelte").useRegisterSW;
}
