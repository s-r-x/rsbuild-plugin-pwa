import { onDestroy, onMount } from "svelte";
import { writable } from "svelte/store";
import type { RegisterSWOptions } from "../types.ts";
import type {
  RegisterSwBindingReturnValue,
  UseRegisterSWReturnValue,
  WritableBoolean,
} from "../types-svelte.ts";
import { registerSW } from "./register-sw.ts";
import { defaultRegisterSwReturnValue } from "./utils.ts";

export type {
  UseRegisterSWReturnValue,
  RegisterSWOptions,
  RegisterSwBindingReturnValue,
  WritableBoolean,
};

/**
 * {@link https://s-r-x.github.io/rsbuild-plugin-pwa/guide/virtual-modules/svelte.html | Usage}
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
      createWorkbox,
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
