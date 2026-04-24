import type { Dispatch, StateUpdater } from "preact/hooks";
import type { RegisterSWReturnValue } from "./types.ts";

export type UseRegisterSWReturnValue = {
  newSwWaiting: [boolean, Dispatch<StateUpdater<boolean>>];
  newSwActive: [boolean, Dispatch<StateUpdater<boolean>>];
  offlineReady: [boolean, Dispatch<StateUpdater<boolean>>];
  skipWaiting: RegisterSWReturnValue["skipWaiting"];
};
