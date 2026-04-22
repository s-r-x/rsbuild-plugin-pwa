import { onMounted, onUnmounted, ref } from "vue";
import type { RegisterSWOptions, RegisterSWReturnValue } from "../types.ts";
import type { UseRegisterSWReturnValue } from "../types-vue.ts";
import { registerSW } from "./register-sw.ts";

export type { RegisterSWOptions, UseRegisterSWReturnValue };

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
 * {@link https://s-r-x.github.io/rsbuild-plugin-pwa/guide/virtual-modules/vue.html | Usage}
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

  const offlineReady = ref(false);
  const newSwWaiting = ref(false);
  const newSwActive = ref(false);

  let skipWaitingFn = defaultRegisterSwReturnValue.skipWaiting;
  let detachEventListenersFn: (() => void) | undefined;

  onMounted(function registerSwEffect() {
    const { skipWaiting, detachEventListeners } = registerSW({
      immediate,
      onOfflineReady() {
        offlineReady.value = true;
        onOfflineReady?.();
      },
      onNewSwWaiting() {
        newSwWaiting.value = true;
        onNewSwWaiting?.();
      },
      onNewSwActive() {
        newSwActive.value = true;
        newSwWaiting.value = false;
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

  onUnmounted(function cleanupRegisterSwEffect() {
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
