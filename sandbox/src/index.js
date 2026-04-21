import { registerSW } from "rsbuild-plugin-pwa_vm/register-sw";

console.log("sandbox");
const { skipWaiting } = registerSW({
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
