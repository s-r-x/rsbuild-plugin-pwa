# Changelog

# [2.2.0](https://github.com/s-r-x/rsbuild-plugin-pwa/compare/v2.1.1...v2.2.0) (2026-04-28)


### Features

* emit web app manifest and sw registration script to rsbuild assets instead of manually writing them to disk ([15684ca](https://github.com/s-r-x/rsbuild-plugin-pwa/commit/15684cae5e47130a39f5b0a32043a91df2b41e40))

## [2.1.1](https://github.com/s-r-x/rsbuild-plugin-pwa/compare/v2.1.0...v2.1.1) (2026-04-28)


### Bug Fixes

* always enable virtual modules plugin unless the env output target is "web-worker" ([d5d6d44](https://github.com/s-r-x/rsbuild-plugin-pwa/commit/d5d6d44f582e9d82f6a3813f1745168634603e61))

# [2.1.0](https://github.com/s-r-x/rsbuild-plugin-pwa/compare/v2.0.0...v2.1.0) (2026-04-27)


### Features

* add `features` to `registerSw` options when using the default registration script ([77d49da](https://github.com/s-r-x/rsbuild-plugin-pwa/commit/77d49dacb7c94d0bc359ed5bce789157367c0a03))

# [2.0.0](https://github.com/s-r-x/rsbuild-plugin-pwa/compare/v1.7.0...v2.0.0) (2026-04-27)


### Features

* native events (waiting-refresh, etc.) are removed from the default SW registration script ([4bd46bf](https://github.com/s-r-x/rsbuild-plugin-pwa/commit/4bd46bf5ff87d3f714315324577f7125a14eb2b0))


### BREAKING CHANGES

* Use virtual modules instead.

# [1.7.0](https://github.com/s-r-x/rsbuild-plugin-pwa/compare/v1.6.0...v1.7.0) (2026-04-27)


### Features

* add `createWorkbox` to virtual modules' options ([adc7f07](https://github.com/s-r-x/rsbuild-plugin-pwa/commit/adc7f07d3080123960b0abba31ed005f47a3a50a))

# [1.6.0](https://github.com/s-r-x/rsbuild-plugin-pwa/compare/v1.5.0...v1.6.0) (2026-04-24)


### Features

* preact virtual module ([3ea80dc](https://github.com/s-r-x/rsbuild-plugin-pwa/commit/3ea80dc670c45c29e002117b2ceebc3d0dacc9ee))

# [1.5.0](https://github.com/s-r-x/rsbuild-plugin-pwa/compare/v1.4.0...v1.5.0) (2026-04-23)


### Features

* **solid:** return plain signals from useRegisterSW ([58e3052](https://github.com/s-r-x/rsbuild-plugin-pwa/commit/58e3052d2174809720ced57a5a2aa96166b1b48e))

# [1.4.0](https://github.com/s-r-x/rsbuild-plugin-pwa/compare/v1.3.0...v1.4.0) (2026-04-23)


### Features

* solid virtual module ([8ead2ed](https://github.com/s-r-x/rsbuild-plugin-pwa/commit/8ead2edb7ddd83cf27938c2aea00eb37ecf1700f))

# [1.3.0](https://github.com/s-r-x/rsbuild-plugin-pwa/compare/v1.2.0...v1.3.0) (2026-04-23)


### Features

* svelte virtual module ([f1da64b](https://github.com/s-r-x/rsbuild-plugin-pwa/commit/f1da64b9f42f79c715388db944c0066b41577a7b))

# [1.2.0](https://github.com/s-r-x/rsbuild-plugin-pwa/compare/v1.1.0...v1.2.0) (2026-04-22)


### Features

* vue virtual module ([ca7ef97](https://github.com/s-r-x/rsbuild-plugin-pwa/commit/ca7ef97a4c26aae2c409fcb6c81416109a514430))

# [1.1.0](https://github.com/s-r-x/rsbuild-plugin-pwa/compare/v1.0.0...v1.1.0) (2026-04-22)


### Features

* support modifyURLPrefix in workbox config ([6777aa5](https://github.com/s-r-x/rsbuild-plugin-pwa/commit/6777aa59b4f97aa925a8b0d795f49c96bfdfa905))

# [1.0.0](https://github.com/s-r-x/rsbuild-plugin-pwa/compare/39ddc9d8fafc468041395c1328efe1979422df95...v1.0.0) (2026-04-22)


### Bug Fixes

* fallback to "/" if the base url is not defined in rsbuild config ([7bd2cf5](https://github.com/s-r-x/rsbuild-plugin-pwa/commit/7bd2cf53afd993ff85d01695655d019acd65cdac))
* **react:** set newSwWaiting to false after activation of the new SW ([08818a4](https://github.com/s-r-x/rsbuild-plugin-pwa/commit/08818a4fa188dbde9c136a55402b738d461aba7f))
* remove swSrc and swDest from workbox options type in injectManifest mode ([66b7d9f](https://github.com/s-r-x/rsbuild-plugin-pwa/commit/66b7d9f4413d4d89f9dc5d445646d5c2ebbc803f))
* the default web app manifest scope is the base url with "/" appended if it's not defined in the config ([4441225](https://github.com/s-r-x/rsbuild-plugin-pwa/commit/44412250e5f1a2a155d53e76dc97dd805fe719a0))


### Features

* "injectManifest" mode ([a8f1b8b](https://github.com/s-r-x/rsbuild-plugin-pwa/commit/a8f1b8b1d2a206e1af4120f7bc0ecb1a9a5d5a9f))
* add "scope" to "registerSw" config ([69827b4](https://github.com/s-r-x/rsbuild-plugin-pwa/commit/69827b48d05c29e40a2e4101a081a0a977f00fd8))
* dev mode ([2119f3e](https://github.com/s-r-x/rsbuild-plugin-pwa/commit/2119f3e5b2c04aec2ff4b20d5e373d5c6fe8069e))
* release ([39ddc9d](https://github.com/s-r-x/rsbuild-plugin-pwa/commit/39ddc9d8fafc468041395c1328efe1979422df95))
* use "output.assetPrefix" if it's defined in rsbuild config to generate asset urls ([9e4f4a4](https://github.com/s-r-x/rsbuild-plugin-pwa/commit/9e4f4a42042ca18426421935dba6ad22b89a42aa))
* virtual modules ([7eb68ea](https://github.com/s-r-x/rsbuild-plugin-pwa/commit/7eb68ea84b15dcb486328150731916c6648054ec))


### Performance Improvements

* don't create a new promise on every dev server request ([decf392](https://github.com/s-r-x/rsbuild-plugin-pwa/commit/decf39261c22f875baa68db0d223efef8fce826a))
