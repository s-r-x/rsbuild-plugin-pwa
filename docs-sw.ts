/// <reference lib="webworker" />
import { cleanupOutdatedCaches, precacheAndRoute } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { CacheFirst } from "workbox-strategies";

const sw = self as unknown as ServiceWorkerGlobalScope;
cleanupOutdatedCaches();
// @ts-expect-error
precacheAndRoute(self.__WB_MANIFEST);

const HTML_CACHE_NAME = "html-pages-cache";

registerRoute(
  ({ request }) => request.destination === "document",
  new CacheFirst({
    cacheName: HTML_CACHE_NAME,
  }),
);

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    sw.skipWaiting();
  }
});

sw.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== HTML_CACHE_NAME) {
            return null;
          }
          console.log(`SW:: Wiping old runtime cache: ${cacheName}`);
          return caches.delete(cacheName);
        }),
      );
    }),
  );
});
