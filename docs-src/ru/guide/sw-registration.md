# Регистрация Service Worker

Существует несколько способов зарегистрировать SW. Это поведение можно настроить с помощью параметра [registerSw](/api/interfaces/index.PWAPluginOptions.html#registersw) в конфигурации плагина.

## Инжект в HTML

Это дефолтный способ. Простой скрипт вставляется в HTML. Он может быть либо [файлом](/api/interfaces/index.RegisterSwScriptConfig.html) либо [inline-скриптом](/api/interfaces/index.RegisterSwInlineConfig.html). Этот скрипт может быть улучшен включением некоторых [встроенных фичей](/api/interfaces/index.DefaultRegisterSwScriptOptions.html#features), но, если вам нужен более полный контроль над регистрацией SW, рекомендуется использовать [виртуальные модули](/guide/virtual-modules.html).

## Виртуальный модуль

Посетите [страницу виртуальных модулей](/guide/virtual-modules.html) для подробностей.

## Ручная регистрация

Если вы хотите отключить стандартный скрипт регистрации, вам нужно передать `false` в это поле, а затем добавить скрипт регистрации вручную. Простейшая версия будет выглядеть примерно так:

```ts
if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    navigator.serviceWorker.register("/sw.js", { scope: "/" });
  });
}
```
