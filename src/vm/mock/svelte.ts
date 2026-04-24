import { writable } from "svelte/store";
import type { RegisterSWOptions } from "../types.ts";
import type { UseRegisterSWReturnValue } from "../types-svelte.ts";
import { mockedSkipWaitingFn } from "./utils.ts";

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
    skipWaiting: mockedSkipWaitingFn,
  };
}
