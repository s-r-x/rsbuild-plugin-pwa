import type { Writable } from "svelte/store";
import type { RegisterSWReturnValue } from "./types.ts";

export interface UseRegisterSWReturnValue extends Pick<
  RegisterSWReturnValue,
  "skipWaiting"
> {
  newSwActive: Writable<boolean>;
  newSwWaiting: Writable<boolean>;
  offlineReady: Writable<boolean>;
}
