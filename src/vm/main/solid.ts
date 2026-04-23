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

  const [offlineReady, setOfflineReady] = createSignal(false);
  const [newSwWaiting, setNewSwWaiting] = createSignal(false);
  const [newSwActive, setNewSwActive] = createSignal(false);

  let skipWaitingFn = defaultRegisterSwReturnValue.skipWaiting;
  let detachEventListenersFn: (() => void) | undefined;

  onMount(function registerSwEffect() {
    const { skipWaiting, detachEventListeners } = registerSW({
      immediate,
      onOfflineReady() {
        setOfflineReady(true);
        onOfflineReady?.();
      },
      onNewSwWaiting() {
        setNewSwWaiting(true);
        onNewSwWaiting?.();
      },
      onNewSwActive() {
        setNewSwActive(true);
        setNewSwWaiting(false);
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
    newSwActive,
    newSwWaiting,
    setNewSwWaiting,
    offlineReady,
    skipWaiting() {
      return skipWaitingFn();
    },
  };
}
