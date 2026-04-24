import { useState } from "react";
import type { RegisterSWOptions } from "../types.ts";
import type { UseRegisterSWReturnValue } from "../types-react.ts";
import { mockedSkipWaitingFn } from "./utils.ts";

export function useRegisterSW(
  _options?: RegisterSWOptions,
): UseRegisterSWReturnValue {
  const offlineReadyTuple = useState(false);
  const newSwWaitingTuple = useState(false);
  const newSwActiveTuple = useState(false);
  return {
    offlineReady: offlineReadyTuple,
    newSwActive: newSwActiveTuple,
    newSwWaiting: newSwWaitingTuple,
    skipWaiting: mockedSkipWaitingFn,
  };
}
