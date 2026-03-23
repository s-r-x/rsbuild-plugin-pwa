# Service Worker registration
There are several ways to register a SW. The behavior can be customized via [registerSw](/api/interfaces/PWAPluginOptions.html#registersw) in the plugin config.
If you wish to disable the default registration script, you need to pass `false` to that field, and then manually add the registration script. Something like this should work:

```ts
if('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js', { scope: '/' })
    })
  }
```
Keep in mind that in that case built-in [SW events](/guide/sw-events) won't work.
