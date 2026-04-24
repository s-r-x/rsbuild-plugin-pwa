import type { Signal } from "solid-js";
import type { RegisterSWReturnValue } from "./types.ts";

export interface UseRegisterSWReturnValue extends Pick<
  RegisterSWReturnValue,
  "skipWaiting"
> {
  newSwActive: Signal<boolean>;
  newSwWaiting: Signal<boolean>;
  offlineReady: Signal<boolean>;
}
