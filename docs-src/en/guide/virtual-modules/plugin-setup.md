# Plugin setup

In order to use virtual modules [registerSw](/api/interfaces/index.PWAPluginOptions.html#registersw) type in the plugin config needs to be changed to [virtual-module](/api/interfaces/index.RegisterSwVirtualModuleConfig.html).

```ts
// rsbuild.config.ts
import { defineConfig } from "@rsbuild/core";
import { pluginPWA } from "rsbuild-plugin-pwa";

export default defineConfig({
  plugins: [
    pluginPWA({
      registerSw: {
        type: "virtual-module",
      },
    }),
  ],
});
```
