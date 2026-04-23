# Vue

[Пример приложения](https://github.com/s-r-x/rsbuild-plugin-pwa/tree/main/examples/vue)

## Настройка плагина

[Инструкции](/guide/virtual-modules/plugin-setup.html)

## Настройка typescript

Add the types to your `tsconfig.json`:

```json5
{
  // ...
  compilerOptions: {
    types: ["rsbuild-plugin-pwa/types/vue"],
  },
}
```

Или добавьте эту строку в ваш глобальный .d.ts файл:

```ts
/// <reference types="rsbuild-plugin-pwa/types/vue" />
```

## Использование

```vue
// App.vue
<script setup lang="ts">
import { useRegisterSW } from "rsbuild-plugin-pwa_vm/vue";

const { skipWaiting, newSwActive, newSwWaiting, offlineReady } = useRegisterSW({
  onRegisterError(error) {
    console.error(error);
  },
  onOfflineReady() {
    console.log("Приложение готово для работы оффлайн");
  },
  onRegister({ registration, swUrl }) {
    console.log("SW зарегистрирован");
  },
  onNewSwActive() {
    console.log(
      "Новый SW контролирует страницу. Самое время чтобы перезагрузить страницу",
    );
    window.location.reload();
  },
  onNewSwWaiting() {
    console.log("Новый SW ожидает активации");
    // window.confirm здесь только для демонстрации
    // не используйте это апи потому что, как минимум, в хромиуме есть баг, который ломает .postMessage когда используются блокирующие апи (как confirm, alert)
    // и существует высокая вероятность, что SW не получит это SKIP_WAITING сообщение
    if (window.confirm("Доступна новая версия приложения. Обновить?")) {
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
