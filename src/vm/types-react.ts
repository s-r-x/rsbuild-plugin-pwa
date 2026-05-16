import type { Dispatch, SetStateAction } from "react";
import type { RegisterSwBindingReturnValue } from "./types.ts";

export type { RegisterSwBindingReturnValue };

export type BooleanStateTuple = [
  state: boolean,
  setter: Dispatch<SetStateAction<boolean>>,
];
export interface UseRegisterSWReturnValue extends RegisterSwBindingReturnValue<
  BooleanStateTuple,
  BooleanStateTuple,
  BooleanStateTuple
> {}
