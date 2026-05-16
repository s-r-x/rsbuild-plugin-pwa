import type { Dispatch, StateUpdater } from "preact/hooks";
import type { RegisterSwBindingReturnValue } from "./types.ts";

export type BooleanStateTuple = [
  state: boolean,
  setter: Dispatch<StateUpdater<boolean>>,
];

export interface UseRegisterSWReturnValue extends RegisterSwBindingReturnValue<
  BooleanStateTuple,
  BooleanStateTuple,
  BooleanStateTuple
> {}
