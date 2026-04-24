import type { Dispatch, SetStateAction } from "react";
import type { RegisterSWReturnValue } from "./types.ts";

export interface UseRegisterSWReturnValue extends Pick<
  RegisterSWReturnValue,
  "skipWaiting"
> {
  newSwWaiting: [boolean, Dispatch<SetStateAction<boolean>>];
  newSwActive: [boolean, Dispatch<SetStateAction<boolean>>];
  offlineReady: [boolean, Dispatch<SetStateAction<boolean>>];
}
