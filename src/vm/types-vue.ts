import type { Ref } from "vue";

export interface UseRegisterSWReturnValue {
  newSwActive: Ref<boolean>;
  newSwWaiting: Ref<boolean>;
  offlineReady: Ref<boolean>;
  skipWaiting: () => Promise<void>;
}
