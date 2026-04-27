import { Workbox } from "workbox-window";
import { registerSW } from "../vm/main/register-sw.ts";

(async function defaultSwRegistrationScript() {
  registerSW({
    createWorkbox({ swUrl, swScope }) {
      return new Workbox(swUrl, { scope: swScope });
    },
  });
})();
