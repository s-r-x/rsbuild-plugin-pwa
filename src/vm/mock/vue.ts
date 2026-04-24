import { ref } from "vue";
import type { RegisterSWOptions } from "../types.ts";
import type { UseRegisterSWReturnValue } from "../types-vue.ts";
import { mockedSkipWaitingFn } from "./utils.ts";

export function useRegisterSW(
  _options: RegisterSWOptions = {},
): UseRegisterSWReturnValue {
  const offlineReady = ref(false);
  const newSwWaiting = ref(false);
  const newSwActive = ref(false);

  return {
    newSwActive,
    newSwWaiting,
    offlineReady,
    skipWaiting: mockedSkipWaitingFn,
  };
}
