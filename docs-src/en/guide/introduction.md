# Introduction

## What does this plugin do?

It uses [workbox-build](https://developer.chrome.com/docs/workbox/modules/workbox-build) to generate a Service Worker (SW) that precaches ([by default](/api/interfaces/GenerateSwModeConfig.html#include)) all assets emitted by Rsbuild. It also generates a SW registration script and a [web app manifest](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest), and injects them into HTML. Every step except SW generation is optional, so you can register the SW and add the web app manifest manually.

## Limitations

- [HTML plugin](https://rsbuild.rs/config/tools/html-plugin#toolshtmlplugin) is required to inject the SW registration script and the web app manifest link. If it's disabled, you'll need to perform these steps manually.
- Only `rsbuild build` command is supported, so **the plugin doesn't work in dev mode**.

## Usage

```sh
npm install -D rsbuild-plugin-pwa
```

```typescript
// rsbuild.config.ts
import { defineConfig } from "@rsbuild/core";
import { pluginPWA } from "rsbuild-plugin-pwa";
export default defineConfig({
  plugins: [pluginPWA()],
});
```

[API](/api)
