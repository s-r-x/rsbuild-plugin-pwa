import type { RegisterSWOptions, RegisterSWReturnValue } from "../types.ts";
import { printRegisterSWMockWarn } from "./utils.ts";
export type { RegisterSWOptions };

export function registerSW(
  _options: RegisterSWOptions = {},
): RegisterSWReturnValue {
  return {
    async detachEventListeners() {},
    skipWaiting() {
      printRegisterSWMockWarn();
      return Promise.resolve();
    },
  };
}
