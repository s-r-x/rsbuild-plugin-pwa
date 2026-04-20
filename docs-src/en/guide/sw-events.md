# Service Worker events

The default SW registration script emits several events using window.dispatchEvent. All events can be consumed like this:

```ts
window.addEventListener("my-event", function () {
  // ...
});
```

Every event can be [renamed](/api/interfaces/index.RegisterSwSharedConfig.html#events) in the [config](/api/interfaces/index.PWAPluginOptions.html#registersw)

[Default events](/api/variables/index.DEFAULT_REG_SW_EVENTS.html)
