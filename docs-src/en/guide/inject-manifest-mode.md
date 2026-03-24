# injectManifest mode

You can build a custom SW by passing `{mode: "injectManifest"}` to the [config](/api/interfaces/PWAPluginOptions.html#sw). The only required field (except `mode`) is [srcFile](/api/interfaces/InjectManifestModeConfig.html#srcfile) which should point to your SW. The plugin uses `rsbuild` to build the SW, so typescript is supported out of the box.

Here's the minimal example:

```ts
import { precacheAndRoute, cleanupOutdatedCaches } from "workbox-precaching";

// this is highly recommended
cleanupOutdatedCaches();

precacheAndRoute(self.__WB_MANIFEST);
```

Notice that `workbox-precaching` should be installed.
