# [1.8.0](https://github.com/streamich/json-joy/compare/v1.7.0...v1.8.0) (2020-10-14)


### Bug Fixes

* 🐛 don't send unsubscribe message, when error received ([18cc84a](https://github.com/streamich/json-joy/commit/18cc84a9f9ef6f68c7ead6038b6d9875c76ad7b2))


### Features

* 🎸 add batching to JsonRxClient ([6d6e13d](https://github.com/streamich/json-joy/commit/6d6e13d8a4ece05adeec4d812d0a1fe783d4e42a))
* 🎸 add batching to RX server ([7f5a78c](https://github.com/streamich/json-joy/commit/7f5a78c3c86164df25c7f0dc721f1976074a4088))
* 🎸 add TimeQueue implementation ([0f837ff](https://github.com/streamich/json-joy/commit/0f837ff76b3c614ca20315fa0cac7c1ca2ce8b3d))
* 🎸 allow JsonRx{Client,Server} to receive batches ([de8ee45](https://github.com/streamich/json-joy/commit/de8ee45dbb1483cf606782d0faa743621a77ad56))

# [1.7.0](https://github.com/streamich/json-joy/compare/v1.6.2...v1.7.0) (2020-10-11)


### Features

* 🎸 add flat with switch statement applyPatch implementatio ([5ca0d86](https://github.com/streamich/json-joy/commit/5ca0d86ad186dfec271af6ba10e4461c49fcea3d))


### Performance Improvements

* ⚡️ speed up applyPatch ([67ee7e2](https://github.com/streamich/json-joy/commit/67ee7e2ce6ad53f9e0506c399bc9997536030d7d))

## [1.6.2](https://github.com/streamich/json-joy/compare/v1.6.1...v1.6.2) (2020-10-11)


### Performance Improvements

* ⚡️ add no-clone benchmark ([15f0f9d](https://github.com/streamich/json-joy/commit/15f0f9da15044b56d2c0c578228ef69c4402d3d2))

## [1.6.1](https://github.com/streamich/json-joy/compare/v1.6.0...v1.6.1) (2020-10-11)


### Performance Improvements

* ⚡️ improve perf ([beaf18b](https://github.com/streamich/json-joy/commit/beaf18b8db293ea8a4e827553151f4371a2a4128))
* ⚡️ improve performance ([f4894de](https://github.com/streamich/json-joy/commit/f4894de648ceede7f8ecabfd61cc9c34346b4a3d))
* ⚡️ set up benchmarking ([bda1a8e](https://github.com/streamich/json-joy/commit/bda1a8e4479908ebf739307ba350b1d3d7c93a46))
* ⚡️ speed up deep cloning ([2c7e1e1](https://github.com/streamich/json-joy/commit/2c7e1e1e243760f7f4b270bc256a1ca93652f140))

# [1.6.0](https://github.com/streamich/json-joy/compare/v1.5.0...v1.6.0) (2020-09-23)


### Features

* 🎸 add ability to stop client ([3f34a93](https://github.com/streamich/json-joy/commit/3f34a93ed4878807777b09a32517a22a366c48bd))

# [1.5.0](https://github.com/streamich/json-joy/compare/v1.4.0...v1.5.0) (2020-09-23)


### Features

* 🎸 add server .stop() method ([11c41dd](https://github.com/streamich/json-joy/commit/11c41ddc641d3c6b009e0d1414a89f8513dd5369))

# [1.4.0](https://github.com/streamich/json-joy/compare/v1.3.1...v1.4.0) (2020-09-22)


### Features

* 🎸 allow to pass through context with every message ([a5871b2](https://github.com/streamich/json-joy/commit/a5871b23c59ff063956df1ba2a5586ca50984dd0))

## [1.3.1](https://github.com/streamich/json-joy/compare/v1.3.0...v1.3.1) (2020-09-17)


### Bug Fixes

* 🐛 improve Rx server typing ([d25a165](https://github.com/streamich/json-joy/commit/d25a165ac0d736b830e6d9bb69d19a9cc0006ac9))
* 🐛 improve rx sever call type ([40eaf07](https://github.com/streamich/json-joy/commit/40eaf07f096fd2812d5517d1d6cf867f29e5dd12))

# [1.3.0](https://github.com/streamich/json-joy/compare/v1.2.0...v1.3.0) (2020-09-17)


### Bug Fixes

* 🐛 remove complete subscption records ([c0fb1e4](https://github.com/streamich/json-joy/commit/c0fb1e4f9be3588efad186056e731ab8ea4be754))


### Features

* 🎸 prevent client from using same ID ([bf5f9d0](https://github.com/streamich/json-joy/commit/bf5f9d07457d3c45e2838f04b44ea99f5f1aad51))

# [1.2.0](https://github.com/streamich/json-joy/compare/v1.1.3...v1.2.0) (2020-09-17)


### Features

* 🎸 allow subscription observable to be wrapped in promise ([9a67900](https://github.com/streamich/json-joy/commit/9a679006430ad89208a4a350aadd6e7c30e05d87))

## [1.1.3](https://github.com/streamich/json-joy/compare/v1.1.2...v1.1.3) (2020-09-16)


### Bug Fixes

* 🐛 better unsubscribe message skipping ([e0fdf95](https://github.com/streamich/json-joy/commit/e0fdf95feb4742dac8e1063be3c70a0db8a9f688))

## [1.1.2](https://github.com/streamich/json-joy/compare/v1.1.1...v1.1.2) (2020-09-16)


### Bug Fixes

* 🐛 don't send unsubscribe message if observable completed ([c256e53](https://github.com/streamich/json-joy/commit/c256e535bfd4e6508b0d6e56fb5eeb63741a76f6))

## [1.1.1](https://github.com/streamich/json-joy/compare/v1.1.0...v1.1.1) (2020-09-04)


### Bug Fixes

* 🐛 use commonjs modules for es6 build ([6523118](https://github.com/streamich/json-joy/commit/652311804c97ca20838a8ce7d5ce24dd8d72251b))

# [1.1.0](https://github.com/streamich/json-joy/compare/v1.0.0...v1.1.0) (2020-09-03)


### Features

* 🎸 add JSON Patch docs ([2d01b3c](https://github.com/streamich/json-joy/commit/2d01b3c1d8f6afc77fc3ed04dd3515a3d0597a32))
* 🎸 implement JSON-RPC server ([a062d18](https://github.com/streamich/json-joy/commit/a062d182fc80aef227b28811c8a6af003cf2bd14))
* 🎸 implement JsonRxRpcServer ([95e4c78](https://github.com/streamich/json-joy/commit/95e4c786c4a490cff1d4fcca145260a002c4fbf5))

# 1.0.0 (2020-09-02)


### Features

* 🎸 implement json-pointer, json-patch, json-rx ([fdaf12a](https://github.com/streamich/json-joy/commit/fdaf12ad2d5d2ad623a943f63a6e12a1c12ce3e1))
