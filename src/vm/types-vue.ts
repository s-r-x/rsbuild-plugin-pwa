import type { Ref } from "vue";
import type { RegisterSwBindingReturnValue } from "./types.ts";

export type { RegisterSwBindingReturnValue };

export type BooleanRef = Ref<boolean>;
export interface UseRegisterSWReturnValue extends RegisterSwBindingReturnValue<
  BooleanRef,
  BooleanRef,
  BooleanRef
> {}
