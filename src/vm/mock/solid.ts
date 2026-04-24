import { createSignal } from "solid-js";
import type { RegisterSWOptions } from "../types.ts";
import type { UseRegisterSWReturnValue } from "../types-solid.ts";
import { mockedSkipWaitingFn } from "./utils.ts";

export function useRegisterSW(
  _options: RegisterSWOptions = {},
): UseRegisterSWReturnValue {
  const offlineReady = createSignal(false);
  const newSwWaiting = createSignal(false);
  const newSwActive = createSignal(false);

  return {
    newSwActive,
    newSwWaiting,
    offlineReady,
    skipWaiting: mockedSkipWaitingFn,
  };
}
