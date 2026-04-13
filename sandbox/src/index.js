console.log("sandbox");
window.addEventListener(
  "rsbuild-plugin-pwa:waiting-refresh",
  function ({ detail: { worker } }) {
    if (
      window.confirm("A new version of the app is available. Reload the page?")
    ) {
      // activate the waiting SW
      worker.postMessage({ type: "SKIP_WAITING" });
      window.location.reload();
    }
  },
);
