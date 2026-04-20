
declare module "rsbuild-plugin-pwa_vm/register-sw" {
  export type RegisterSWOptions =
    import("../vm-dist/main/register-sw").RegisterSWOptions;
  export type RegisterSWReturnValue =
    import("../vm-dist/main/register-sw").RegisterSWReturnValue;

  export const registerSW: typeof import("../vm-dist/main/register-sw").registerSW;
}
