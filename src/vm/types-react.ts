import type { Dispatch, SetStateAction } from "react";
import type { RegisterSWReturnValue } from "./types.ts";

export type UseRegisterSWReturnValue = {
  newSwWaiting: [boolean, Dispatch<SetStateAction<boolean>>];
  newSwActive: [boolean, Dispatch<SetStateAction<boolean>>];
  offlineReady: [boolean, Dispatch<SetStateAction<boolean>>];
  skipWaiting: RegisterSWReturnValue["skipWaiting"];
};
