# Регистрация Service Worker

Существует несколько способов зарегистрировать SW. Это поведение можно настроить с помощью параметра [registerSw](/api/interfaces/PWAPluginOptions.html#registersw) в конфигурации плагина.

## Инжект в HTML
Это дефолтный способ. Простой скрипт вставляется в HTML. Он может быть либо [файлом](/api/interfaces/RegisterSwScriptConfig.html) либо [inline-скриптом](/api/interfaces/RegisterSwInlineConfig.html).

## Virtual module
Посетите [страницу виртуальных модулей](/guide/virtual-modules.html) для подробностей.

## Ручная регистрация
Если вы хотите отключить стандартный скрипт регистрации, вам нужно передать `false` в это поле, а затем добавить скрипт регистрации вручную. Простейшая версия будет выглядеть как-то так:

```ts
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' });
  });
}
```

Имейте в виду, что в этом случае встроенные [события SW](/guide/sw-events) работать не будут.
