import { onMounted, onUnmounted, ref } from "vue";
import type { RegisterSWOptions, RegisterSWReturnValue } from "../types.ts";
import type { UseRegisterSWReturnValue } from "../types-vue.ts";
import { registerSW } from "./register-sw.ts";
import { defaultSkipWaitingFn } from "./utils.ts";

export type { RegisterSWOptions, UseRegisterSWReturnValue };

const defaultRegisterSwReturnValue: Pick<RegisterSWReturnValue, "skipWaiting"> =
  {
    skipWaiting: defaultSkipWaitingFn,
  };

/**
 * {@link https://s-r-x.github.io/rsbuild-plugin-pwa/guide/virtual-modules/vue.html | Usage}
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
      createWorkbox,
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
