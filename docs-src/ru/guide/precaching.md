# Предварительное кэширование

Плагин [переопределяет](/api/interfaces/index.GenerateSwModeConfig.html#include) значение **globPatterns** по умолчанию для `workbox-build` и выполняет предварительное кэширование только тех ресурсов, которые были сгенерированы Rsbuild, а также нескольких артефактов, связанных с SW (например, манифеста веб-приложения). Это поведение легко настраивается через [конфигурацию](/api/interfaces/index.GenerateSwModeConfig.html#include).
