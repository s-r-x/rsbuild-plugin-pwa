import { useState } from "preact/hooks";
import type { RegisterSWOptions } from "../types.ts";
import type { UseRegisterSWReturnValue } from "../types-preact.ts";
import { printRegisterSWMockWarn } from "./utils.ts";

async function skipWaiting() {
  printRegisterSWMockWarn();
}
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
    skipWaiting,
  };
}
