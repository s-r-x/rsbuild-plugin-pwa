import { createSignal, onCleanup, onMount } from "solid-js";
import type { RegisterSWOptions, RegisterSWReturnValue } from "../types.ts";
import type { UseRegisterSWReturnValue } from "../types-solid.ts";
import { registerSW } from "./register-sw.ts";

export type { UseRegisterSWReturnValue, RegisterSWOptions };

const defaultRegisterSwReturnValue: Pick<RegisterSWReturnValue, "skipWaiting"> =
  {
    skipWaiting() {
      console.warn(
        "registerSW hasn't been called yet so this doesn't have any effect",
      );
      return Promise.resolve();
    },
  };

/**
 * {@link https://s-r-x.github.io/rsbuild-plugin-pwa/guide/virtual-modules/solid.html | Usage}
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

  const offlineReadySignal = createSignal(false);
  const newSwWaitingSignal = createSignal(false);
  const newSwActiveSignal = createSignal(false);

  let skipWaitingFn = defaultRegisterSwReturnValue.skipWaiting;
  let detachEventListenersFn: (() => void) | undefined;

  onMount(function registerSwEffect() {
    const { skipWaiting, detachEventListeners } = registerSW({
      immediate,
      onOfflineReady() {
        offlineReadySignal[1](true);
        onOfflineReady?.();
      },
      onNewSwWaiting() {
        newSwWaitingSignal[1](true);
        onNewSwWaiting?.();
      },
      onNewSwActive() {
        newSwActiveSignal[1](true);
        newSwWaitingSignal[1](false);
        onNewSwActive?.();
      },
      onRegister(...args) {
        onRegister?.(...args);
      },
      onRegisterError(e) {
        onRegisterError?.(e);
      },
    });

    skipWaitingFn = skipWaiting;
    detachEventListenersFn = detachEventListeners;
  });

  onCleanup(function cleanupRegisterSwEffect() {
    detachEventListenersFn?.();
  });

  return {
    newSwActive: newSwActiveSignal,
    newSwWaiting: newSwWaitingSignal,
    offlineReady: offlineReadySignal,
    skipWaiting() {
      return skipWaitingFn();
    },
  };
}
