# Режим injectManifest

Вы можете создать собственный Service Worker, передав `{mode: "injectManifest"}` в [конфиг](/api/interfaces/PWAPluginOptions.html#sw). Единственным обязательным полем (помимо `mode`) является [srcFile](/api/interfaces/InjectManifestModeConfig.html#srcfile), которое должно указывать на путь к вашему SW. Плагин использует `rsbuild` для сборки SW, поэтому typescript поддерживается из коробки.

Минимальный пример:

```ts
import { precacheAndRoute, cleanupOutdatedCaches } from "workbox-precaching";

// настоятельно рекомендуется
cleanupOutdatedCaches();

precacheAndRoute(self.__WB_MANIFEST);

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
```

Обратите внимание, что `workbox-precaching` должен быть установлен.
