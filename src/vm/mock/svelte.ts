import { writable } from "svelte/store";
import type { RegisterSWOptions, RegisterSWReturnValue } from "../types.ts";
import type { UseRegisterSWReturnValue } from "../types-svelte.ts";
import { printRegisterSWMockWarn } from "./utils.ts";

const defaultRegisterSwReturnValue: Pick<RegisterSWReturnValue, "skipWaiting"> =
  {
    skipWaiting() {
      printRegisterSWMockWarn();
      return Promise.resolve();
    },
  };

/**
 * {@link https://s-r-x.github.io/rsbuild-plugin-pwa/guide/virtual-modules/svelte.html | Usage}
 */
export function useRegisterSW(
  _options: RegisterSWOptions = {},
): UseRegisterSWReturnValue {
  const offlineReady = writable(false);
  const newSwWaiting = writable(false);
  const newSwActive = writable(false);

  return {
    newSwActive,
    newSwWaiting,
    offlineReady,
    skipWaiting: defaultRegisterSwReturnValue.skipWaiting,
  };
}
