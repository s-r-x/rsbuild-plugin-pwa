import type { Writable } from "svelte/store";
import type { RegisterSWReturnValue } from "./types.ts";

export type UseRegisterSWReturnValue = {
  newSwActive: Writable<boolean>;
  newSwWaiting: Writable<boolean>;
  offlineReady: Writable<boolean>;
  skipWaiting: RegisterSWReturnValue['skipWaiting'];
};
