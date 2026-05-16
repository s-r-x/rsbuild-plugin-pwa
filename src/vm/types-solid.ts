import type { Signal } from "solid-js";
import type { RegisterSwBindingReturnValue } from "./types.ts";

export type { RegisterSwBindingReturnValue };

export type BooleanSignal = Signal<boolean>;
export interface UseRegisterSWReturnValue extends RegisterSwBindingReturnValue<
  BooleanSignal,
  BooleanSignal,
  BooleanSignal
> {}
