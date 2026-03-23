# rsbuild-plugin-pwa

Zero-config PWA support for rsbuild

[Docs](https://s-r-x.github.io/rsbuild-plugin-pwa)

## Usage

```sh
npm install -D rsbuild-plugin-pwa
```
* * *
```typescript
// rsbuild.config.ts
import {defineConfig} from "@rsbuild/core";
import {pluginPWA} from "rsbuild-plugin-pwa";
export default defineConfig({
  plugins: [pluginPWA()]
});
```
