import type { RegisterSWOptions, RegisterSWReturnValue } from "../types.ts";
import { mockedSkipWaitingFn } from "./utils.ts";

export function registerSW(
  _options: RegisterSWOptions = {},
): RegisterSWReturnValue {
  return {
    async detachEventListeners() {},
    skipWaiting: mockedSkipWaitingFn,
  };
}
