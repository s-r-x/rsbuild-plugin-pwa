import { ref } from "vue";
import type { RegisterSWOptions, RegisterSWReturnValue } from "../types.ts";
import type { UseRegisterSWReturnValue } from "../types-vue.ts";

export type { RegisterSWOptions };

const defaultRegisterSwReturnValue: Pick<RegisterSWReturnValue, "skipWaiting"> =
  {
    skipWaiting() {
      console.warn(
        "registerSW hasn't been called yet so this doesn't have any effect",
      );
      return Promise.resolve();
    },
  };

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
    skipWaiting: defaultRegisterSwReturnValue.skipWaiting,
  };
}
