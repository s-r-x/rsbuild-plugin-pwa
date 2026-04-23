import type { Signal } from "solid-js";
import type { RegisterSWReturnValue } from "./types.ts";

export type UseRegisterSWReturnValue = {
  newSwActive: Signal<boolean>;
  newSwWaiting: Signal<boolean>;
  offlineReady: Signal<boolean>;
  skipWaiting: RegisterSWReturnValue["skipWaiting"];
};
