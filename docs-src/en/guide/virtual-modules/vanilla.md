# Vanilla

[Example app](https://github.com/s-r-x/rsbuild-plugin-pwa/tree/main/examples/vanilla)

## Plugin setup

[Instructions](/guide/virtual-modules/plugin-setup.html)

## Typescript setup

Add the types to your `tsconfig.json`:

```json5
{
  // ...
  compilerOptions: {
    types: ["rsbuild-plugin-pwa/types/register-sw"],
  },
}
```

Or add this line to your global .d.ts:

```ts
/// <reference types="rsbuild-plugin-pwa/types/register-sw" />
```

## Usage

```ts
// main.ts
import { registerSW } from "rsbuild-plugin-pwa_vm/register-sw";

const { skipWaiting } = registerSW({
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
```

[API](/api/modules/vm_main_register-sw.html)

[Source code](https://github.com/s-r-x/rsbuild-plugin-pwa/blob/main/src/vm/main/register-sw.ts)
