# Введение

## Что делает этот плагин?

Он использует [workbox-build](https://developer.chrome.com/docs/workbox/modules/workbox-build) для генерации Service Worker (SW), который предварительно кэширует ([по умолчанию](/api/interfaces/GenerateSwModeConfig.html#include)) все ресурсы, созданные Rsbuild, генерирует скрипт регистрации SW и [манифест веб-приложения](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest), а затем внедряет их в HTML. Все шаги, кроме генерации SW, являются необязательными, поэтому вы можете зарегистрировать SW и добавить манифест веб-приложения вручную.

## Ограничения

- Для внедрения скрипта регистрации SW и ссылки на манифест веб-приложения [HTML плагин](https://rsbuild.rs/config/tools/html-plugin#toolshtmlplugin) должен быть включен. Если он отключен, вам придется выполнить эти шаги вручную.

## Использование

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

[API](/api/modules/index.html)
