# Настройка плагина

Чтобы использовать виртуальные модули тип [registerSw](/api/interfaces/index.PWAPluginOptions.html#registersw) в конфиге плагина должен быть изменен на [virtual-module](/api/interfaces/index.RegisterSwVirtualModuleConfig.html).

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
