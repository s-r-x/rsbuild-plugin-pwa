import { useEffect, useRef, useState } from "preact/hooks";
import type { RegisterSWOptions, RegisterSWReturnValue } from "../types.ts";
import type { UseRegisterSWReturnValue } from "../types-preact.ts";
import { registerSW } from "./register-sw.ts";
import { defaultSkipWaitingFn } from "./utils.ts";

export type { RegisterSWOptions, UseRegisterSWReturnValue };

const defaultRegisterSwReturnValue: Pick<RegisterSWReturnValue, "skipWaiting"> =
  {
    skipWaiting: defaultSkipWaitingFn,
  };

/**
 * {@link https://s-r-x.github.io/rsbuild-plugin-pwa/guide/virtual-modules/preact.html | Usage}
 */
export function useRegisterSW(
  options: RegisterSWOptions = {},
): UseRegisterSWReturnValue {
  const {
    immediate = true,
    onNewSwActive,
    onNewSwWaiting,
    onOfflineReady,
    onRegister,
    onRegisterError,
  } = options;

  const [registerSwReturnValue, setRegisterSwReturnValue] = useState(
    defaultRegisterSwReturnValue,
  );
  const offlineReadyTuple = useState(false);
  const newSwWaitingTuple = useState(false);
  const newSwActiveTuple = useState(false);
  const callbacks = {
    onNewSwActive,
    onNewSwWaiting,
    onOfflineReady,
    onRegister,
    onRegisterError,
  };
  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;
  useEffect(function registerSwEffect() {
    const { skipWaiting, detachEventListeners } = registerSW({
      immediate,
      onOfflineReady() {
        offlineReadyTuple[1](true);
        callbacksRef.current.onOfflineReady?.();
      },
      onNewSwWaiting() {
        newSwWaitingTuple[1](true);
        callbacksRef.current.onNewSwWaiting?.();
      },
      onNewSwActive() {
        newSwActiveTuple[1](true);
        newSwWaitingTuple[1](false);
        callbacksRef.current.onNewSwActive?.();
      },
      onRegister(...args) {
        callbacksRef.current.onRegister?.(...args);
      },
      onRegisterError(e) {
        callbacksRef.current.onRegisterError?.(e);
      },
    });
    setRegisterSwReturnValue({ skipWaiting });
    return function cleanupRegisterSwEffect() {
      detachEventListeners();
    };
  }, []);

  return {
    newSwActive: newSwActiveTuple,
    newSwWaiting: newSwWaitingTuple,
    offlineReady: offlineReadyTuple,
    skipWaiting: registerSwReturnValue.skipWaiting,
  };
}
