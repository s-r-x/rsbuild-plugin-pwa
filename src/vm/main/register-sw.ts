import type { WorkboxLifecycleEvent } from "workbox-window";
import type { RegisterSWOptions, RegisterSWReturnValue } from "../types.ts";

const swUrl = "__SW_URL";
const swScope = "__SW_SCOPE";

export type { RegisterSWOptions, RegisterSWReturnValue };

/**
 * {@link https://s-r-x.github.io/rsbuild-plugin-pwa/guide//virtual-modules/vanilla.html | Usage}
 */
export function registerSW({
  immediate,
  onNewSwActive,
  onNewSwWaiting,
  onOfflineReady,
  onRegister,
  onRegisterError,
}: RegisterSWOptions = {}): RegisterSWReturnValue {
  async function register(): Promise<
    { skipWaiting: () => void; detachEventListeners: () => void } | undefined
  > {
    if (!("serviceWorker" in navigator)) {
      console.warn("SW is not supported in this environment");
      return;
    }

    const wb = await import("workbox-window")
      .then(function ({ Workbox }) {
        return new Workbox(swUrl, {
          scope: swScope,
        });
      })
      .catch(function (e) {
        onRegisterError?.(e);
        return null;
      });
    if (!wb) return;

    const wbEventCallbacks = {
      controlling(event: WorkboxLifecycleEvent) {
        if (event.isUpdate) {
          onNewSwActive?.();
        }
      },
      installed(event: WorkboxLifecycleEvent) {
        if (event.isUpdate) return;

        if (typeof event.isUpdate === "undefined" && event.isExternal) {
          notifyUpdateReady();
          return;
        }

        if (!hasPromptedForUpdate) {
          onOfflineReady?.();
        }
      },
    };

    let hasPromptedForUpdate = false;

    const notifyUpdateReady = function () {
      hasPromptedForUpdate = true;
      wb.addEventListener("controlling", wbEventCallbacks.controlling);
      onNewSwWaiting?.();
    };

    wb.addEventListener("installed", wbEventCallbacks.installed);

    wb.addEventListener("waiting", notifyUpdateReady);

    try {
      const registration = await wb.register({ immediate });
      onRegister?.({
        registration,
        swUrl,
      });
    } catch (e) {
      onRegisterError?.(e);
    }

    return {
      skipWaiting() {
        return wb.messageSkipWaiting();
      },
      detachEventListeners() {
        wb.removeEventListener("installed", wbEventCallbacks.installed);
        wb.removeEventListener("waiting", notifyUpdateReady);
        wb.removeEventListener("controlling", wbEventCallbacks.controlling);
      },
    };
  }

  const registerSWPromise = register();

  return {
    async detachEventListeners() {
      const result = await registerSWPromise;
      result?.detachEventListeners();
    },
    async skipWaiting() {
      const result = await registerSWPromise;
      if (result) {
        return result.skipWaiting();
      } else {
        console.warn(
          "SW registration failed or is not supported by this browser. skipWaiting has no effect.",
        );
      }
    },
  };
}
