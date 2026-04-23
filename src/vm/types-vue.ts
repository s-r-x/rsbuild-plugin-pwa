import type { Ref } from "vue";
import type { RegisterSWReturnValue } from "./types.ts";

export interface UseRegisterSWReturnValue {
  newSwActive: Ref<boolean>;
  newSwWaiting: Ref<boolean>;
  offlineReady: Ref<boolean>;
  skipWaiting: RegisterSWReturnValue["skipWaiting"];
}
