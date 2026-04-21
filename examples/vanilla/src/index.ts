import "./index.css";
import { Confirm } from "notiflix/build/notiflix-confirm-aio";
import { Notify } from "notiflix/build/notiflix-notify-aio";
import { registerSW } from "rsbuild-plugin-pwa_vm/register-sw";

const { skipWaiting } = registerSW({
  onRegisterError(error) {
    Notify.failure(
      "Something went wrong during SW registration. Check the console for details",
    );
    console.error(error);
  },
  onOfflineReady() {
    Notify.success("The app is ready to work offline");
  },
  onRegister({ registration, swUrl }) {
    Notify.info(
      `The SW is registered. SW url: ${swUrl}. Scope: ${registration?.scope ?? "???"}`,
    );
  },
  onNewSwActive() {
    Notify.info("Updated. The page is about to refresh");
    setTimeout(function () {
      window.location.reload();
    }, 1500);
  },
  onNewSwWaiting() {
    Confirm.show(
      "A new version is available",
      "Update the app?",
      "Yes",
      "No",
      function onConfirm() {
        skipWaiting();
      },
    );
  },
});

const rootEl = document.querySelector("#root");
if (rootEl) {
  rootEl.innerHTML = `
  <div class="content">
    <h1>Vanilla Rsbuild</h1>
    <p>Start building amazing things with Rsbuild</p>
    <p>(and rsbuild-plugin-pwa)</p>
  </div>
`;
}
