# Регистрация Service Worker

Существует несколько способов зарегистрировать SW. Это поведение можно настроить с помощью параметра [registerSw](/api/interfaces/PWAPluginOptions.html#registersw) в конфигурации плагина.

Если вы хотите отключить стандартный скрипт регистрации, вам нужно передать `false` в это поле, а затем добавить скрипт регистрации вручную. Что-то вроде того:

```ts
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' });
  });
}
```

Имейте в виду, что в этом случае встроенные [события SW](/guide/sw-events) работать не будут.
