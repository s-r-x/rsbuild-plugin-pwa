# Vue

[Example app](https://github.com/s-r-x/rsbuild-plugin-pwa/tree/main/examples/vue)

## Plugin setup

[Instructions](/guide/virtual-modules/plugin-setup.html)

## Typescript setup

Add the types to your `tsconfig.json`:

```json5
{
  // ...
  compilerOptions: {
    types: ["rsbuild-plugin-pwa/types/vue"],
  },
}
```

Or add this line to your global .d.ts:

```ts
/// <reference types="rsbuild-plugin-pwa/types/vue" />
```

## Usage

```vue
// App.vue
<script setup lang="ts">
import { useRegisterSW } from "rsbuild-plugin-pwa_vm/vue";

const { skipWaiting, newSwActive, newSwWaiting, offlineReady } = useRegisterSW({
  onRegisterError(error) {
    console.error(error);
  },
  onOfflineReady() {
    console.log("the app is ready to work offline");
  },
  onRegister({ registration, swUrl }) {
    console.log("the sw is registered");
  },
  onNewSwActive() {
    console.log(
      "the new sw is controlling the page. it's time to refresh the page",
    );
    window.location.reload();
  },
  onNewSwWaiting() {
    console.log("the new sw is waiting...");
    // window.confirm is for demonstration purposes only
    // don't use it cause there's a bug at least in chromium
    // that breaks .postMessage when thread blocking apis (like confirm, alert) are used
    // and there's a high chance that the SW won't receive that SKIP_WAITING message
    if (window.confirm("A new version of the app is available. Update?")) {
      skipWaiting();
    }
  },
});
</script>

<template>
  <div>{{ offlineReady ? "ready" : "not ready" }}</div>
</template>
```

[API](/api/modules/vm_main_vue.html)

[Source code](https://github.com/s-r-x/rsbuild-plugin-pwa/blob/main/src/vm/main/vue.ts)
