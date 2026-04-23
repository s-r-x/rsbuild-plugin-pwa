import { onDestroy, onMount } from "svelte";
import { writable } from "svelte/store";
import type { RegisterSWOptions, RegisterSWReturnValue } from "../types.ts";
import type { UseRegisterSWReturnValue } from "../types-svelte.ts";
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
 * {@link https://s-r-x.github.io/rsbuild-plugin-pwa/guide/virtual-modules/svelte.html | Usage}
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

  const offlineReady = writable(false);
  const newSwWaiting = writable(false);
  const newSwActive = writable(false);

  let skipWaitingFn = defaultRegisterSwReturnValue.skipWaiting;
  let detachEventListenersFn: (() => void) | undefined;

  onMount(function registerSwEffect() {
    const { skipWaiting, detachEventListeners } = registerSW({
      immediate,
      onOfflineReady() {
        offlineReady.set(true);
        onOfflineReady?.();
      },
      onNewSwWaiting() {
        newSwWaiting.set(true);
        onNewSwWaiting?.();
      },
      onNewSwActive() {
        newSwActive.set(true);
        newSwWaiting.set(false);
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

  onDestroy(function cleanupRegisterSwEffect() {
    detachEventListenersFn?.();
  });

  return {
    newSwActive,
    newSwWaiting,
    offlineReady,
    skipWaiting() {
      return skipWaitingFn();
    },
  };
}
