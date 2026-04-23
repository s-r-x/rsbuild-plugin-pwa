import { createSignal } from "solid-js";
import type { RegisterSWOptions, RegisterSWReturnValue } from "../types.ts";
import type { UseRegisterSWReturnValue } from "../types-solid.ts";
import { printRegisterSWMockWarn } from "./utils.ts";

export type { RegisterSWOptions };

const defaultRegisterSwReturnValue: Pick<RegisterSWReturnValue, "skipWaiting"> =
  {
    skipWaiting() {
      printRegisterSWMockWarn();
      return Promise.resolve();
    },
  };

/**
 * {@link https://s-r-x.github.io/rsbuild-plugin-pwa/guide/virtual-modules/solid.html | Usage}
 */
export function useRegisterSW(
  _options: RegisterSWOptions = {},
): UseRegisterSWReturnValue {
  const [offlineReady] = createSignal(false);
  const [newSwWaiting, setNewSwWaiting] = createSignal(false);
  const [newSwActive] = createSignal(false);

  return {
    newSwActive,
    newSwWaiting,
    setNewSwWaiting,
    offlineReady,
    skipWaiting: defaultRegisterSwReturnValue.skipWaiting,
  };
}
