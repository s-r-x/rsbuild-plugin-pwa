# События Service Worker

Стандартный скрипт регистрации SW генерирует несколько событий с помощью `window.dispatchEvent`. Эти события можно обрабатывать следующим образом:

```ts
window.addEventListener("my-event", function () {
  // ...
});
```

Каждое событие при необходимости может быть [переименовано](/api/interfaces/index.RegisterSwSharedConfig.html#events) в [конфиге](/api/interfaces/index.PWAPluginOptions.html#registersw)

[Дефолтные события](/api/variables/index.DEFAULT_REG_SW_EVENTS.html)
