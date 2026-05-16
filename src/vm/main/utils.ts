import type { RegisterSWReturnValue } from "../types.ts";

export async function defaultSkipWaitingFn() {
  console.warn(
    "registerSW hasn't been called yet so this doesn't have any effect",
  );
}

export const defaultRegisterSwReturnValue: Pick<
  RegisterSWReturnValue,
  "skipWaiting"
> = {
  skipWaiting: defaultSkipWaitingFn,
};
