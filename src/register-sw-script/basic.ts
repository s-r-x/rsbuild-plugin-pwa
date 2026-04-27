if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    navigator.serviceWorker.register("__SW_URL", { scope: "__SW_SCOPE" });
  });
}
