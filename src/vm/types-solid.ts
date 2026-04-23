import type { Accessor, Setter } from "solid-js";
import type { RegisterSWReturnValue } from "./types.ts";

export type UseRegisterSWReturnValue = {
  newSwActive: Accessor<boolean>;
  newSwWaiting: Accessor<boolean>;
  setNewSwWaiting: Setter<boolean>;
  offlineReady: Accessor<boolean>;
  skipWaiting: RegisterSWReturnValue["skipWaiting"];
};
