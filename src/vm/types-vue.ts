import type { Ref } from "vue";
import type { RegisterSWReturnValue } from "./types.ts";

export interface UseRegisterSWReturnValue extends Pick<
  RegisterSWReturnValue,
  "skipWaiting"
> {
  newSwActive: Ref<boolean>;
  newSwWaiting: Ref<boolean>;
  offlineReady: Ref<boolean>;
}
