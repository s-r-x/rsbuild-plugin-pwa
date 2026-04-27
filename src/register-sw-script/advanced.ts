import { Workbox } from "workbox-window";
import type { DefaultRegisterSwScriptFeatures } from "../types.ts";
import { registerSW } from "../vm/main/register-sw.ts";

const features: DefaultRegisterSwScriptFeatures = JSON.parse(
  '"__SCRIPT_FEATURES"',
);
(async function defaultSwRegistrationScript() {
  const { skipWaiting } = registerSW({
    onNewSwActive() {
      if (features.autoReloadPage) {
        window.location.reload();
      }
    },
    onNewSwWaiting() {
      if (features.autoSkipWaiting) {
        skipWaiting();
      }
    },
    createWorkbox({ swUrl, swScope }) {
      return new Workbox(swUrl, { scope: swScope });
    },
  });
})();
