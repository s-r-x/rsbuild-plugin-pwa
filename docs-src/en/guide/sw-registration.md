# Service Worker registration
There are several ways to register a SW. The behavior can be customized via [registerSw](/api/interfaces/index.PWAPluginOptions.html#registersw) in the plugin config.
## Script injection
This is the default one. A simple script is injected into the html. It can be either a [script file](/api/interfaces/index.RegisterSwScriptConfig.html) or an [inline script](/api/interfaces/index.RegisterSwInlineConfig.html).
## Virtual module
Check out [virtual modules page](/guide/virtual-modules.html) for details.

## Manual registration
If you want to register a SW manually, [registerSw](/api/interfaces/index.PWAPluginOptions.html#registersw) needs to be `false`. You can then manually add the registration script. The simplest version might look something like this:

```ts
if('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js', { scope: '/' })
    })
  }
```
Keep in mind that in that case built-in [SW events](/guide/sw-events) won't work.
