# События Service Worker

Стандартный скрипт регистрации SW генерирует несколько событий с помощью `window.dispatchEvent`. Эти события можно обрабатывать следующим образом:

```ts
window.addEventListener("my-event", function () {
  // ...
});
```

Каждое событие при необходимости может быть [переименовано](/api/interfaces/RegisterSwSharedConfig.html#events) в [конфиге](/api/interfaces/PWAPluginOptions.html#registersw)

[Дефолтные события](/api/variables/DEFAULT_REG_SW_EVENTS.html)
