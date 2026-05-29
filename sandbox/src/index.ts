/// <reference types="../../types/register-sw.d.ts" />
/// <reference types="../../types/debug.d.ts" />
import * as debug from "rsbuild-plugin-pwa_vm/debug";
import { registerSW } from "rsbuild-plugin-pwa_vm/register-sw";
import { Workbox } from "workbox-window";

debug.printDebugValues();
console.log("base url: ", debug.getBaseUrl());
console.log("sw url: ", debug.getSwUrl());
console.log("sw scope: ", debug.getSwScope());
console.log("build date:", debug.getBuildDate());
console.log("custom values:", debug.getCustomDebugValues());
console.log("plugin version", debug.getPluginVersion());

console.log("sandbox");
const { skipWaiting } = registerSW({
  createWorkbox({ swUrl, swScope }) {
    return new Workbox(swUrl, { scope: swScope });
  },
  onRegisterError(error) {
    console.error(error);
  },
  onOfflineReady() {
    console.log("the app is ready to work offline");
  },
  onRegister({ registration, swUrl }) {
    console.log("the sw is registered");
    console.log("registration:", registration);
    console.log("sw url: " + swUrl);
  },

  onNewSwActive() {
    console.log(
      "the new sw is controlling the page. it's time to refresh the page",
    );
    window.location.reload();
  },
  onNewSwWaiting() {
    console.log("the new sw is waiting...");
    if (window.confirm("A new version of the app is available. Update?")) {
      skipWaiting();
    }
  },
});
