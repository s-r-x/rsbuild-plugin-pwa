import { precacheAndRoute } from "workbox-precaching";

// @ts-expect-error
precacheAndRoute(self.__WB_MANIFEST);
