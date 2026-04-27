import { createSignal, onCleanup, onMount } from "solid-js";
import type { RegisterSWOptions, RegisterSWReturnValue } from "../types.ts";
import type { UseRegisterSWReturnValue } from "../types-solid.ts";
import { registerSW } from "./register-sw.ts";
import { defaultSkipWaitingFn } from "./utils.ts";

export type { UseRegisterSWReturnValue, RegisterSWOptions };

const defaultRegisterSwReturnValue: Pick<RegisterSWReturnValue, "skipWaiting"> =
  {
    skipWaiting: defaultSkipWaitingFn,
  };

/**
 * {@link https://s-r-x.github.io/rsbuild-plugin-pwa/guide/virtual-modules/solid.html | Usage}
 */
export function useRegisterSW({
  immediate = true,
  onNewSwActive,
  onNewSwWaiting,
  onOfflineReady,
  onRegister,
  onRegisterError,
  createWorkbox,
}: RegisterSWOptions = {}): UseRegisterSWReturnValue {
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
      createWorkbox,
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
