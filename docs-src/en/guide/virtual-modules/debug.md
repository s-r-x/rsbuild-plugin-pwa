# Debug

## Plugin setup

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

## Typescript setup

Add the types to your `tsconfig.json`:

```json5
{
  // ...
  compilerOptions: {
    types: ["rsbuild-plugin-pwa/types/debug"],
  },
}
```

Or add this line to your global .d.ts:

```ts
/// <reference types="rsbuild-plugin-pwa/types/debug" />
```

## Usage

```ts
// index.ts
import * as debug from "rsbuild-plugin-pwa_vm/debug";

debug.printDebugValues();

console.log("base url: ", debug.getBaseUrl());
console.log("sw url: ", debug.getSwUrl());
console.log("sw scope: ", debug.getSwScope());
console.log("build date:", debug.getBuildDate());
// returns customDebugValues from rsbuild config
console.log("custom values:", debug.getCustomDebugValues());
console.log("plugin version", debug.getPluginVersion());
```

[API](/api/modules/vm_main_debug.html)

[Source code](https://github.com/s-r-x/rsbuild-plugin-pwa/blob/main/src/vm/main/debug.ts)
