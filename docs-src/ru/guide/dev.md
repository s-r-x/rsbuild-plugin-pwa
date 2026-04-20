# Dev режим

Начиная с `v0.3.0` плагин работает с `rsbuild dev`командой.
Для активации передайте `true` в [dev конфиг](/api/interfaces/index.PWAPluginOptions.html#dev).
Обратите внимание, что сгенерированный SW предварительно ничего не кеширует (precache) в dev режиме.
