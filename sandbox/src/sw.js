import * as workboxPrecaching from "workbox-precaching";

workboxPrecaching.cleanupOutdatedCaches();
workboxPrecaching.precacheAndRoute(self.__WB_MANIFEST);

const SW_VERSION = "1.0.0";
self.addEventListener("message", (event) => {
  if (event.data.type === "GET_VERSION") {
    event.ports[0].postMessage(SW_VERSION);
  }
});
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
