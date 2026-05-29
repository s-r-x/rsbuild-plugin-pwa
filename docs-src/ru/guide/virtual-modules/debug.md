# Debug

## Настройка плагина

```ts
// rsbuild.config.ts
import { defineConfig } from "@rsbuild/core";
import { pluginPWA } from "rsbuild-plugin-pwa";

const customDebugValues = {
  some: "value",
}
export default defineConfig({
  plugins: [
    pluginPWA({
      registerSw: {
        type: "virtual-module",
        customDebugValues,
      },
    }),
  ],
});
```

## Настройка typescript

Добавьте типы в `tsconfig.json`:

```json5
{
  // ...
  compilerOptions: {
    types: ["rsbuild-plugin-pwa/types/debug"],
  },
}
```

Или добавьте эту строку в ваш глобальный .d.ts файл:

```ts
/// <reference types="rsbuild-plugin-pwa/types/debug" />
```

## Использование

```ts
// index.ts
import * as debug from "rsbuild-plugin-pwa_vm/debug";

debug.printDebugValues();

console.log("base url: ", debug.getBaseUrl());
console.log("sw url: ", debug.getSwUrl());
console.log("sw scope: ", debug.getSwScope());
console.log("build date:", debug.getBuildDate());
// вернет customDebugValues из конфига rsbuild
console.log("custom values:", debug.getCustomDebugValues());
console.log("plugin version", debug.getPluginVersion());
```

[API](/api/modules/vm_main_debug.html)

[Исходный код](https://github.com/s-r-x/rsbuild-plugin-pwa/blob/main/src/vm/main/debug.ts)
