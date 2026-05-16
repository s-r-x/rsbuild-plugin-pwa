import type { Writable } from "svelte/store";
import type { RegisterSwBindingReturnValue } from "./types.ts";

export type { RegisterSwBindingReturnValue };

export type WritableBoolean = Writable<boolean>;
export interface UseRegisterSWReturnValue extends RegisterSwBindingReturnValue<
  WritableBoolean,
  WritableBoolean,
  WritableBoolean
> {}
