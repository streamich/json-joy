## [2.18.1](https://github.com/streamich/json-joy/compare/v2.18.0...v2.18.1) (2021-08-15)


### Bug Fixes

* 🐛 add es2020 build target ([e3f6bec](https://github.com/streamich/json-joy/commit/e3f6becd7a6485723278e957b782c49f8f80d365))
* 🐛 publish es2020 target to NPM ([bcd0648](https://github.com/streamich/json-joy/commit/bcd06488398318e0639b1a79c61b1fb74a82b7a2))

# [2.18.0](https://github.com/streamich/json-joy/compare/v2.17.0...v2.18.0) (2021-08-15)


### Bug Fixes

* 🐛 support quotes and special characters in stirngs ([05599c5](https://github.com/streamich/json-joy/commit/05599c5c1e4cb0b098e43ebddb70f49c5ddcab77))


### Features

* 🎸 implement json-size ([0d67ae7](https://github.com/streamich/json-joy/commit/0d67ae72b95950ce4e0bf0881baf21becce87694))


### Performance Improvements

* ⚡️ add benchmarks ([9d08da4](https://github.com/streamich/json-joy/commit/9d08da40aeb765277e7ab6995df35328407cf08d))

# [2.17.0](https://github.com/streamich/json-joy/compare/v2.16.4...v2.17.0) (2021-08-01)


### Bug Fixes

* 🐛 on persisten client call wait for for first rpc duplex ([bdedd9b](https://github.com/streamich/json-joy/commit/bdedd9b6b4d6d02b63e89d2afbb45dc8dd5d57f3))


### Features

* 🎸 expose .call() methods which return a Promise ([1c05336](https://github.com/streamich/json-joy/commit/1c05336feaff9c52d5758b30d2ec5e26e61d8f94))
* 🎸 improve persistent client ([fb55b16](https://github.com/streamich/json-joy/commit/fb55b168a20e371576cbaa440afc6882d531ff6a))
* 🎸 improve start() and stop() of persistent client ([259f0c3](https://github.com/streamich/json-joy/commit/259f0c30eb17712d611b87d5507fdcd4efb59632))
* 🎸 send periodic ".ping" keep-alive messages ([944b23f](https://github.com/streamich/json-joy/commit/944b23ff492be07bb6356e8ddc0bc6ef436f4db4))

## [2.16.4](https://github.com/streamich/json-joy/compare/v2.16.3...v2.16.4) (2021-08-01)


### Bug Fixes

* 🐛 reset reconnect retry country only on successful open ([85f92cb](https://github.com/streamich/json-joy/commit/85f92cb1caa16cde7a0d3a07a8effff4687930a6))

## [2.16.3](https://github.com/streamich/json-joy/compare/v2.16.2...v2.16.3) (2021-08-01)


### Bug Fixes

* 🐛 revert back channel predicate ([923baf5](https://github.com/streamich/json-joy/commit/923baf50d7c5c7c7eecf3089bc0f6aae536e305a))

## [2.16.2](https://github.com/streamich/json-joy/compare/v2.16.1...v2.16.2) (2021-08-01)


### Bug Fixes

* 🐛 make array type explicit ([a7f223f](https://github.com/streamich/json-joy/commit/a7f223f0b3c80f396f11257ecc497ec773805321))
* 🐛 try reconnecting only when channel is empty ([498fc32](https://github.com/streamich/json-joy/commit/498fc328d340caa10f092926122d45ce51c3789c))

## [2.16.1](https://github.com/streamich/json-joy/compare/v2.16.0...v2.16.1) (2021-07-26)


### Bug Fixes

* 🐛 do not wrap validation errors ([1feac4b](https://github.com/streamich/json-joy/commit/1feac4b90022792c706af2c5f1e6540f731a74f8))

# [2.16.0](https://github.com/streamich/json-joy/compare/v2.15.0...v2.16.0) (2021-07-25)


### Bug Fixes

* 🐛 capture and format all call and call$ api caller errors ([7d7e365](https://github.com/streamich/json-joy/commit/7d7e365d7d74419b814c255a7d25092d414a996c))
* 🐛 do not decrement in-flight call count without increment ([d772e82](https://github.com/streamich/json-joy/commit/d772e821312a4f2c2adb075437613247fd460ee8))
* 🐛 errorId must be a string ([ce6a0f9](https://github.com/streamich/json-joy/commit/ce6a0f98989b5fc86d88314b2d29bafb7c91be9e))
* 🐛 improve how in-flight call count tracked in streams ([5065161](https://github.com/streamich/json-joy/commit/5065161eb929d37cd9a066c09a71b8ff262a74b9))


### Features

* 🎸 export public APIs ([5b60166](https://github.com/streamich/json-joy/commit/5b60166de34a04bb9175cb7d91cc8d121d757dc8))
* 🎸 make connection creation function optional ([3573d2a](https://github.com/streamich/json-joy/commit/3573d2a01b9b77bb489cb31319290ad281a3d230))

# [2.15.0](https://github.com/streamich/json-joy/compare/v2.14.0...v2.15.0) (2021-07-25)


### Bug Fixes

* 🐛 correctly extract method name from URL ([4fb19e2](https://github.com/streamich/json-joy/commit/4fb19e279bab7686785abf463dc28e7ca4bc2818))


### Features

* 🎸 expose Reactive-RPC over NDJSON ([a2f14d8](https://github.com/streamich/json-joy/commit/a2f14d8cb0aa1e05430a3711414143aa01281523))

# [2.14.0](https://github.com/streamich/json-joy/compare/v2.13.0...v2.14.0) (2021-07-25)


### Features

* 🎸 add uWebSocket.js SSE integration over GET ([b96fbcc](https://github.com/streamich/json-joy/commit/b96fbcc557fc0ad8f7c115a03aae6405d15b0868))
* 🎸 expose Reactive-RPC over uWebsocket.js SSE ([f610509](https://github.com/streamich/json-joy/commit/f61050908b06c204aa86bd6f988bb40e86dbbc58))
* 🎸 improve GET SSE implementation ([edb4bf0](https://github.com/streamich/json-joy/commit/edb4bf07ba9dfaefda99e591378992d0a44902ef))

# [2.13.0](https://github.com/streamich/json-joy/compare/v2.12.0...v2.13.0) (2021-07-24)


### Features

* 🎸 expose Reactive-RPC over HTTP POST ([a1be947](https://github.com/streamich/json-joy/commit/a1be9471548c74b4f3043c14ee4bdf4ad56d88dc))
* 🎸 expose Reactive-RPC throught GET HTTP ([f523089](https://github.com/streamich/json-joy/commit/f52308956e64f5b2695c0116245b5cfa86dacc12))
* 🎸 improve POST RPC ([e208a9a](https://github.com/streamich/json-joy/commit/e208a9afb0bd3f9373e72cdaa507f8e4a48b4877))

# [2.12.0](https://github.com/streamich/json-joy/compare/v2.11.0...v2.12.0) (2021-07-24)


### Bug Fixes

* 🐛 detect uint8 correctly ([82e3562](https://github.com/streamich/json-joy/commit/82e356255efbaa8d8ddfb54299eecdaf5a145ea6))
* 🐛 do not execute pre-call checks with invalid payload ([39b2db1](https://github.com/streamich/json-joy/commit/39b2db14f179106257862bbe673f8b855a1dbd31))
* 🐛 exec .call() method as member property ([10fb22b](https://github.com/streamich/json-joy/commit/10fb22b2056a7d31d245697d89ad789192f78d02))
* 🐛 flush pre-call buffer on next micro tick ([f29073e](https://github.com/streamich/json-joy/commit/f29073eefbdf277397d4f0b780b80cfedfde9b8b))
* 🐛 format static method errors ([4e061f6](https://github.com/streamich/json-joy/commit/4e061f61396751780c83af4d32989ecdbe97912f))
* 🐛 start binary-rx sub ID from 1 ([8d77b74](https://github.com/streamich/json-joy/commit/8d77b74a9d566542a82e733597e452891d60f99d))
* 🐛 subscribe to call$ data after the pipeline is created ([843f645](https://github.com/streamich/json-joy/commit/843f645f3b135b3c69350584fa344d2e1d24df14))


### Features

* 🎸 add .call() method to client ([ce7ec10](https://github.com/streamich/json-joy/commit/ce7ec1046475b043527f120e1610f9753815b614))
* 🎸 add BufferSubject ([35497d2](https://github.com/streamich/json-joy/commit/35497d2283b360b0531ad14622d492a191919816))
* 🎸 add Channel interface and implement WebSocketChannel ([1ed5963](https://github.com/streamich/json-joy/commit/1ed59639ec3bb83ffa5d00ca00b55d62129c7a4f))
* 🎸 add compact codec implementation for uWebSocket.js ([a967a91](https://github.com/streamich/json-joy/commit/a967a91e93b0509c48ed4dac24f862bcdb4e0006))
* 🎸 add context creation utility ([c9f293a](https://github.com/streamich/json-joy/commit/c9f293a85e7da427dd3a613827b2b7710e2cddb3))
* 🎸 add CORS helper for uws ([f7f3e7a](https://github.com/streamich/json-joy/commit/f7f3e7af59dec521530d3bf7c0c0e11005fb6223))
* 🎸 add demo for binary-rx ([7d6f731](https://github.com/streamich/json-joy/commit/7d6f73168384cea33e09530dc9e7661b6e779d5a))
* 🎸 add error formatter class ([151378e](https://github.com/streamich/json-joy/commit/151378eecde721d0e17daaa84a945ab5624ea128))
* 🎸 add reactive websocket wrappers ([904ce04](https://github.com/streamich/json-joy/commit/904ce0422bef7e0971b40a550f4d6ad5b179f5a3))
* 🎸 add reactive-rpc ([9a2f9e2](https://github.com/streamich/json-joy/commit/9a2f9e2faaf5734f70e444383a3b0988916787d3))
* 🎸 add Reactive-RPC messages to JSON-Rx encoding ([0192b47](https://github.com/streamich/json-joy/commit/0192b473c6c10b40eb05c93e29aa38c4b9053738))
* 🎸 add request validation for streaming methods ([2c487b8](https://github.com/streamich/json-joy/commit/2c487b84ddce71a7d44b60d7c40043d01df4a892))
* 🎸 add RpcServerLocalClient ([34a032d](https://github.com/streamich/json-joy/commit/34a032df0cd4ee7c800c7c78c542ebb0adb516b2))
* 🎸 add RpcValidationError ([c7d0c56](https://github.com/streamich/json-joy/commit/c7d0c56bc282742fbd5067f5f93dadc3b16ff1c6))
* 🎸 add server onsend level 0 listener ([0e1c40d](https://github.com/streamich/json-joy/commit/0e1c40d4b7c221f6ee43c868c1c6770e71f17f6c))
* 🎸 allow single message per WebSocket frame ([e8146a0](https://github.com/streamich/json-joy/commit/e8146a0a5f55737c27a7038faf5e2ae1b5895ad4))
* 🎸 connect RpcServer to uWebSocket.js ([3344940](https://github.com/streamich/json-joy/commit/3344940ba7deb0cc703ffd71ce0c8da6a75a8008))
* 🎸 do not send server complete when client unsubscribes ([c6876a1](https://github.com/streamich/json-joy/commit/c6876a18058f0c571438a0fc330b88a65b214505))
* 🎸 enforce max number of in-flight calls ([6982f2f](https://github.com/streamich/json-joy/commit/6982f2f65634bc1fab1ba307f0ff8917de14490d))
* 🎸 execute pre-call checks before static methods ([fb06ca5](https://github.com/streamich/json-joy/commit/fb06ca5981a150d2a52a0949d6f03553ee269d1e))
* 🎸 expose error formatter for validation errors ([7def828](https://github.com/streamich/json-joy/commit/7def828e2e75368eede3c18344c78fa3be2e7c6b))
* 🎸 expose onPreCall prop ([cf65a2a](https://github.com/streamich/json-joy/commit/cf65a2a3e8252be9394322347da28d2465153a52))
* 🎸 implement persistent RPC client ([61aacfd](https://github.com/streamich/json-joy/commit/61aacfd64bcdb96142dcc4cb3260896ecde467d8))
* 🎸 implement persistent websocket ([8e763d1](https://github.com/streamich/json-joy/commit/8e763d1e410b49ca56827d54e9a255f5d92aedfe))
* 🎸 implement RpcApiCaller ([ddcba99](https://github.com/streamich/json-joy/commit/ddcba99a154b773614c4d28cf90fb273d23f4eec))
* 🎸 improve channel implementation ([c713a7d](https://github.com/streamich/json-joy/commit/c713a7dc197d6d8cb5cc44ed28d22104efb26dc4))
* 🎸 improve context creation ([3d5d3cb](https://github.com/streamich/json-joy/commit/3d5d3cb91cc748aae4f44ff2aa403e8798cb0c6e))
* 🎸 improve enableCors() method ([8170d77](https://github.com/streamich/json-joy/commit/8170d77dbb260e34f858da0e8c61cf5b14d76d12))
* 🎸 improve error formatting ([78daa54](https://github.com/streamich/json-joy/commit/78daa549199cb2dbccb21113ee0104c37845c689))
* 🎸 improve error handling in RpcApiCaller ([5edca45](https://github.com/streamich/json-joy/commit/5edca456f1be2f0eb0f76b8577f5fba7e2c3cd57))
* 🎸 improve interface of ApiCaller and remove error formatt ([b44fefc](https://github.com/streamich/json-joy/commit/b44fefc2d46b3f5657c3e094ac7d081575592fe8))
* 🎸 improve message validation ([2b56785](https://github.com/streamich/json-joy/commit/2b567855c2a0bbca81664238da7a25777b039c3f))
* 🎸 improve persistent channel ([d10e9e8](https://github.com/streamich/json-joy/commit/d10e9e830259c23d8348fd8e6cb402c74ad39e17))
* 🎸 improve Reactive-RPC interfaces ([e0ef3fc](https://github.com/streamich/json-joy/commit/e0ef3fc4dd4522e44750127a79d6d24d8fb5f192))
* 🎸 improve reactive-rpc method types ([16b4c15](https://github.com/streamich/json-joy/commit/16b4c15fabfb5869f72ff445f1c414b4127387b7))
* 🎸 improve RpcApiCaller ([0d59e81](https://github.com/streamich/json-joy/commit/0d59e81f42bfa2899493bc6f1cee133b565c4bb0))
* 🎸 improve RxWebSocket ([6af6c90](https://github.com/streamich/json-joy/commit/6af6c90b2726bf7c569ae4b325932e6108707c5c))
* 🎸 make ApiCaller create a "call" object for each request ([e334f95](https://github.com/streamich/json-joy/commit/e334f9596c5240a292e8420eb106102e1406e374))
* 🎸 normalize default constants and send .err notification ([73e4910](https://github.com/streamich/json-joy/commit/73e4910a60ec29e69126197692b4880f978b99fe))
* 🎸 progress on pre-call buffer size ([7176658](https://github.com/streamich/json-joy/commit/71766588770bbe4f469fb991a2a0688f4c848906))
* 🎸 progress on pre-call check for streaming method ([2a6ce83](https://github.com/streamich/json-joy/commit/2a6ce83ca0a13e593c4898eb429e5d29164f62de))
* 🎸 progress towards making RpcServer using RpcApiCaller ([bb2ae34](https://github.com/streamich/json-joy/commit/bb2ae3421b369676cb5484e4838a3a4f8b0a6691))
* 🎸 shortend response complete message and norm messages ([fd92734](https://github.com/streamich/json-joy/commit/fd92734338b2aae9dcdb67616f2fffafc93972e3))
* 🎸 small improvements ([f6a079b](https://github.com/streamich/json-joy/commit/f6a079b169def6fbed375725e398b999dc272eab))
* 🎸 start on refactoring RpcServer ([ec955fc](https://github.com/streamich/json-joy/commit/ec955fc9166f8ba8a2c64a00611a30470bf5d1f8))
* 🎸 synchronously flush request buffer ([748278f](https://github.com/streamich/json-joy/commit/748278f7b0d38f4765a7afe7b965984bffa1d1ea))
* 🎸 timeout streaming RPC calls on long inactivity ([7dce942](https://github.com/streamich/json-joy/commit/7dce942e41a8df38d3f4d5eb6fd9cbcf3361c9ea))
* 🎸 track when websocket is closed ([72c294a](https://github.com/streamich/json-joy/commit/72c294ac9371bfa2f3c1ef0ada76ec1a861c8d81))
* 🎸 validate static method requests ([d0f76f6](https://github.com/streamich/json-joy/commit/d0f76f6637b9678c8df8912d23ff8572118044f5))


### Performance Improvements

* ⚡️ encode a single message if there is only one in a batch ([447939b](https://github.com/streamich/json-joy/commit/447939b9758c9c5890b1cbcbc6062599dea242f8))

# [2.11.0](https://github.com/streamich/json-joy/compare/v2.10.0...v2.11.0) (2021-05-09)


### Bug Fixes

* 🐛 correctly encode nested nominal JSON Patch ops ([f1a788e](https://github.com/streamich/json-joy/commit/f1a788e0e264b611d4c1ac4c161fa608febd9df0))
* 🐛 make JSON Patch binary encoding pass main test suite ([42fa98b](https://github.com/streamich/json-joy/commit/42fa98b37258fb8a355810e9d700646132d50b66))


### Features

* 🎸 implement binary encoding for JSON Patch ([7d10b84](https://github.com/streamich/json-joy/commit/7d10b842c3a1bc27709462e7dab65d76a99c9a7d))
* 🎸 implement JSON Patch binary codec decoding ([0530ab6](https://github.com/streamich/json-joy/commit/0530ab6c3844349aa2bf4b3642fb7e39b055441a))
* 🎸 implement JSON Patch compact codec ([7914a37](https://github.com/streamich/json-joy/commit/7914a37cc0d2bb1d1e5d909a7ccd9bc903d99f13))
* 🎸 implement JSON Patch nominal JSON codec ([de5c8c3](https://github.com/streamich/json-joy/commit/de5c8c3594159a67bcd4b5239e287f3ddc7e1bfe))


### Performance Improvements

* ⚡️ do not dynamically allocate op mnemonics ([0362c63](https://github.com/streamich/json-joy/commit/0362c63826e0cc5e2b30d52aa02836d3517c895a))

# [2.10.0](https://github.com/streamich/json-joy/compare/v2.9.1...v2.10.0) (2021-05-06)


### Features

* 🎸 implement JSON-Rx server part with plain JS objects ([c765d95](https://github.com/streamich/json-joy/commit/c765d95f101fcb34547df3518b357f53be6e74b8))

## [2.9.1](https://github.com/streamich/json-joy/compare/v2.9.0...v2.9.1) (2021-05-02)


### Bug Fixes

* 🐛 create data view at offset in MessagePack decoder ([2887f26](https://github.com/streamich/json-joy/commit/2887f265cd68c47977264fb9d574715a85dbce77))
* 🐛 use byteOffset when creating DataView ([518001d](https://github.com/streamich/json-joy/commit/518001d2d08786cd10aa435540446e7a3a7b36c1))

# [2.9.0](https://github.com/streamich/json-joy/compare/v2.8.0...v2.9.0) (2021-04-17)


### Bug Fixes

* 🐛 clone array chunk nodes ([efe4cdf](https://github.com/streamich/json-joy/commit/efe4cdf24a85a042d8203ab33e490bb20a0800d2))
* 🐛 correctly check server timestmap equality ([f38a53c](https://github.com/streamich/json-joy/commit/f38a53c91c4ee73e52bfc8132c6951c9a4f95849))
* 🐛 correctly encode 8 byte b1vuint56 numbers ([e01acdc](https://github.com/streamich/json-joy/commit/e01acdcd05ec7336eaad56512c990ec8b67ecd18))
* 🐛 correctly encode UTF-8 strings ([0ac0a1d](https://github.com/streamich/json-joy/commit/0ac0a1d61b60fcb213945f861dd9ea7a545f33eb))
* 🐛 correctly execute JSON Patch "move" ([04f168c](https://github.com/streamich/json-joy/commit/04f168c757efd42fe697858f3e6ab491cd0eb744))
* 🐛 do not return undefined keys in view ([efb8f32](https://github.com/streamich/json-joy/commit/efb8f3219c38f6c1c210515cdd1ac0fa8a1293d7))
* 🐛 handle empty strings in cached key decoder ([66008b2](https://github.com/streamich/json-joy/commit/66008b2154f39f5a35180d3bfcd298c33a74d550))
* 🐛 throw correctly when time is skipped ([f965bf9](https://github.com/streamich/json-joy/commit/f965bf9406b2f77a06a2bb0909e54210df696574))


### Features

* 🎸 add array decoding ([226c3ec](https://github.com/streamich/json-joy/commit/226c3ecb36a73ebc8d6ce831c7ac87b3afe7f15c))
* 🎸 add array fuzzing ([531882e](https://github.com/streamich/json-joy/commit/531882eba40339bf645a2a4b8aeb68ea96e1bad3))
* 🎸 add b1vuint28 decoder ([61c05ca](https://github.com/streamich/json-joy/commit/61c05ca35d63ed27cdff4022c90c244a8e83e0b1))
* 🎸 add b1vuint56 decoder ([9a69c4a](https://github.com/streamich/json-joy/commit/9a69c4a6b38c5821f63893976f1f704d793dd14e))
* 🎸 add binary encoding for compound objects ([c04bed6](https://github.com/streamich/json-joy/commit/c04bed627d07b59a3364563c32cd6671ed2d5e82))
* 🎸 add clock decoder ([ba25f35](https://github.com/streamich/json-joy/commit/ba25f35d382ee8378a012ddb6b7cd49b5b58307d))
* 🎸 add clock encoding ([0c6085a](https://github.com/streamich/json-joy/commit/0c6085a0579ad535c63820299517d1627ccd0176))
* 🎸 add clock table encoding ([15b7e40](https://github.com/streamich/json-joy/commit/15b7e40651e1fb14f0f3910f54c8bf0393bf0375))
* 🎸 add encoding for constant type ([3aab177](https://github.com/streamich/json-joy/commit/3aab1778c12d8e019ded2802f304637ab24a4792))
* 🎸 add encoding for relative IDs ([d9980a5](https://github.com/streamich/json-joy/commit/d9980a58f525d10383359f0074eb6c568c958a88))
* 🎸 add id decoder ([a920d8b](https://github.com/streamich/json-joy/commit/a920d8b243079f62801bf9e93df642fa3712b015))
* 🎸 add json nominal encoding for server time ([7476077](https://github.com/streamich/json-joy/commit/7476077ec059f3130483466e6331c2103e7150f3))
* 🎸 add length() method ([b63fd9a](https://github.com/streamich/json-joy/commit/b63fd9a6e3d7f22c7f2ce066d95459486ad42ba4))
* 🎸 add node index implementation for server clock ([df90865](https://github.com/streamich/json-joy/commit/df90865dac357af8968ceac81549453a373b367e))
* 🎸 add object decoding ([3264b34](https://github.com/streamich/json-joy/commit/3264b34a1602af71a6041a3667e040e4c35fd5b3))
* 🎸 add random JSON generator ([1e07efc](https://github.com/streamich/json-joy/commit/1e07efccb43127e940a1c622c2b15da2b874c45f))
* 🎸 add server time codec for binary compact encoding ([c0fc622](https://github.com/streamich/json-joy/commit/c0fc62260f9ff68913a0e74ae516c109a58156e8))
* 🎸 add server time codec to snapshot compact codec ([93d1079](https://github.com/streamich/json-joy/commit/93d1079a95745f04e7a5dcbf173ffa5bbe521e02))
* 🎸 add string decoding ([e1204e4](https://github.com/streamich/json-joy/commit/e1204e4eee48b49dd5646273730c3f9a770756a0))
* 🎸 add value node encoding ([63dcbd0](https://github.com/streamich/json-joy/commit/63dcbd060b23da06cc36111b7344c5edacc4ced6))
* 🎸 add value node fuzzing ([26c7a9d](https://github.com/streamich/json-joy/commit/26c7a9db60cd4383392eb406060c11fa76a58632))
* 🎸 add vuint39 decoder ([0982366](https://github.com/streamich/json-joy/commit/0982366959ffad3765dcb6307cec6daab4f52556))
* 🎸 add vuint57 decoder ([2a16681](https://github.com/streamich/json-joy/commit/2a16681afa5c953f0752851ff1915f7e1aaf9e0b))
* 🎸 create models through static methods ([fecef74](https://github.com/streamich/json-joy/commit/fecef74972f1dca7a2347e22b865aaed88ab68a3))
* 🎸 do not allow time travel ([5c2e1ec](https://github.com/streamich/json-joy/commit/5c2e1ec34bafc058fe80b898cb39978a6719ec53))
* 🎸 generate 53 bit session IDs ([d3e3241](https://github.com/streamich/json-joy/commit/d3e32413386bc8523e3bf78954942c8eec4fc365))
* 🎸 implement binary codec for model with server time ([f0ba189](https://github.com/streamich/json-joy/commit/f0ba1891a09ebc786effc2d2c30db5d96ca24d95))
* 🎸 implement binary decoder ([e246f1a](https://github.com/streamich/json-joy/commit/e246f1abfb8141fb03a2cc79b2d70dafc16a4dbb))
* 🎸 implement JSON Patch translator to CRDT operations ([82d3219](https://github.com/streamich/json-joy/commit/82d3219f568c25abdeb41dff914873a602a7694a))
* 🎸 improve logical vector clock ([ba50714](https://github.com/streamich/json-joy/commit/ba507144462379f3c220abb6f2ca9b5f39366f03))
* 🎸 improve random generator ([e3621de](https://github.com/streamich/json-joy/commit/e3621de8f7ddd0ca5b893a5f5e5d632a8cac3075))
* 🎸 improve vector clock encoding ([42ad785](https://github.com/streamich/json-joy/commit/42ad785ae14590ec98d15ba44acf465d3efac2b4))


### Performance Improvements

* ⚡️ dont index constant type symbols ([25a379c](https://github.com/streamich/json-joy/commit/25a379cca7435e235604b8e67ae82ede9b2bb11d))

# [2.8.0](https://github.com/streamich/json-joy/compare/v2.7.0...v2.8.0) (2021-04-11)


### Bug Fixes

* 🐛 correctly encode negative fixint in v2 encoder ([43ad76f](https://github.com/streamich/json-joy/commit/43ad76f16488a48a967fc93c994e2a46b288f3bd))
* 🐛 do not overwrite previous buffer ([86b4a1d](https://github.com/streamich/json-joy/commit/86b4a1d1d73187ccb88982787d6376ef07491362))
* 🐛 fixes for v2 encoder ([cb5cae0](https://github.com/streamich/json-joy/commit/cb5cae0151233b032914e857c0d653cd04ff4c9a))
* 🐛 index decoded nodes from nominal JSON encoding ([2b63792](https://github.com/streamich/json-joy/commit/2b637928f72dfadf8a4160d05ecd6eba9dd8bc15))


### Features

* 🎸 add "val_set" operatin ([037484b](https://github.com/streamich/json-joy/commit/037484b3a3e34da40769785ddfbbc51ea7dce43d))
* 🎸 add constants to binary encoding ([14108f3](https://github.com/streamich/json-joy/commit/14108f3a07462a77b560762257d21c9d6e0307b9))
* 🎸 add JSON Compact to MessagePack encoding ([354d904](https://github.com/streamich/json-joy/commit/354d9042a4b616836b537b01feb4254d31cfe94d))
* 🎸 add json-pack CLI ([f0e4fd4](https://github.com/streamich/json-joy/commit/f0e4fd4f99a98cfb5b3e60defb2e7f618a535166))
* 🎸 add json-pack-test CLI utility ([029923e](https://github.com/streamich/json-joy/commit/029923ec063a1f5c7547ae0a954dffbacc9694b6))
* 🎸 add json-unpack CLI ([149b278](https://github.com/streamich/json-joy/commit/149b2787fbf3c455c7fa31c1db1e42dbb935a534))
* 🎸 add nominal json encoder ([f17efff](https://github.com/streamich/json-joy/commit/f17efff675632bac5ede4d7bb47e144d1ac2f93a))
* 🎸 add nominal structural JSON encoding types ([3c55ef0](https://github.com/streamich/json-joy/commit/3c55ef0655c6bc4da11baf68261dadbc641d30e9))
* 🎸 add number encodings ([6f0ab7a](https://github.com/streamich/json-joy/commit/6f0ab7adcb0546d87662f9bd35f4f78a09ceee40))
* 🎸 add structural JSON encoder ([0f53fbe](https://github.com/streamich/json-joy/commit/0f53fbe106f35d7cda8dfc73fc63370008cd70fa))
* 🎸 add value "val" type ([2c0ca2f](https://github.com/streamich/json-joy/commit/2c0ca2f46c70167bc2525a35d915a68c7a3f6ab7))
* 🎸 add value operation encoding to compact encoding ([810481a](https://github.com/streamich/json-joy/commit/810481acb8be4f6471e78356e40b6656e65126d5))
* 🎸 add value type operations to nominal JSON encoding ([88ff979](https://github.com/streamich/json-joy/commit/88ff979a6c78c3416d60f8a25c2c67ad4c9826d8))
* 🎸 add value type support to document ([badaf65](https://github.com/streamich/json-joy/commit/badaf65a8689d91d8f562861d7977bf744130890))
* 🎸 add variable length integer encoding methods ([a3ee324](https://github.com/streamich/json-joy/commit/a3ee324477e158b2a37488dccf357b25a9b64055))
* 🎸 implement nominal JSON decoder ([0d9bd73](https://github.com/streamich/json-joy/commit/0d9bd73335bb0598a8e5b1d2113e828faa23c22a))
* 🎸 implemet compact JSON CRDT decoder ([267de02](https://github.com/streamich/json-joy/commit/267de02f0d48fa04a8390523dbff526fba711563))
* 🎸 improve clock encoding ([1287c53](https://github.com/streamich/json-joy/commit/1287c53cad1304685c2e3090f262caa8c4b465e3))
* 🎸 modularize v4 encoder and create msgpack encoder interf ([02da6a8](https://github.com/streamich/json-joy/commit/02da6a830c0c4ad1d4def4c9504efbbc1b9380ae))


### Performance Improvements

* ⚡️ add Binary-Rx benchmarks ([c8ea340](https://github.com/streamich/json-joy/commit/c8ea34014863d9fa2440f79d269421665c293870))
* ⚡️ improve performace of Binary-Rx encoder ([5d04aa5](https://github.com/streamich/json-joy/commit/5d04aa56ae09dcc59f142c045f3719822f6d03f0))
* ⚡️ keep references directly to nodes ([56c94cd](https://github.com/streamich/json-joy/commit/56c94cdf6324a0b54843fa49e5bcbd7ac0e467e2))
* ⚡️ update json-pack benchmarks ([4a9baf8](https://github.com/streamich/json-joy/commit/4a9baf8d69a08c85586a98c72b8af6470acd6fa1))

# [2.7.0](https://github.com/streamich/json-joy/compare/v2.6.0...v2.7.0) (2021-04-05)


### Bug Fixes

* 🐛 adjust binary encoding for new root and obj_set ops ([0d16120](https://github.com/streamich/json-joy/commit/0d161209410114c01baf44cea7a24cc1f7f95984))
* 🐛 allow decoding more than one object key ([e00184e](https://github.com/streamich/json-joy/commit/e00184e6744f0925f60ab825c950fa6a7fa70601))
* 🐛 correctly encode 8 byte negative integers ([aed9ce3](https://github.com/streamich/json-joy/commit/aed9ce3ff875779bbccebbb42372d22ff24f9088))
* 🐛 correctly merge array operations ([693c88c](https://github.com/streamich/json-joy/commit/693c88c8c14835a9b8efbbf11b89f4afb833ebce))
* 🐛 do not apply already applied operations ([ca90c7a](https://github.com/streamich/json-joy/commit/ca90c7ae06cb68ce8d167c65f77befeee98d7c20))
* 🐛 do not insert empty list elements in json builder ([0aa799f](https://github.com/streamich/json-joy/commit/0aa799f26e9c74aad91ffdb6d47906c735ebf2ac))
* 🐛 do not merge new chunk with a deleted chunk ([f511d1b](https://github.com/streamich/json-joy/commit/f511d1be2a81552fe39c210252e63cb542839453))
* 🐛 fix array and string decoding ([3ab65fd](https://github.com/streamich/json-joy/commit/3ab65fd38ef96ee6e2b0db8dee4ad935eb00b977))
* 🐛 fix doc forking and clock table building ([a15f374](https://github.com/streamich/json-joy/commit/a15f374ae68db661c629b444d81028bba2f275c1))


### Features

* 🎸 add "arr" field for "arr_ins" in compact encoding ([986456c](https://github.com/streamich/json-joy/commit/986456c5b55512f29e0246d130aae178ca587774))
* 🎸 add "arr" field to "arr_ins" for binary codec ([e433536](https://github.com/streamich/json-joy/commit/e433536118d79b0cfad3bc1313566632418c1c6c))
* 🎸 add "arr" field to arr_ins operation ([d55d5eb](https://github.com/streamich/json-joy/commit/d55d5ebdf777526f90665fabe1c591b78e6aeb8f))
* 🎸 add "noop" operation binary encoding ([7183fe3](https://github.com/streamich/json-joy/commit/7183fe3b22c55e6be14eda5f5ac0be893f7c343d))
* 🎸 add "noop" operation encoding to compact JSON codec ([1ab6045](https://github.com/streamich/json-joy/commit/1ab604535888d0fdeb40735ceb916c62b613e72e))
* 🎸 add ability to clone a document ([2776e38](https://github.com/streamich/json-joy/commit/2776e38535744bea130999dd1015add20df3e7c0))
* 🎸 add ability to find array value by index ([0ca5e1e](https://github.com/streamich/json-joy/commit/0ca5e1e2b0286f1c3da4cb67dff00a0287e4a07a))
* 🎸 add ability to fork a document ([8917e89](https://github.com/streamich/json-joy/commit/8917e893b498929892197e9743057cc7fc9cf979))
* 🎸 add all string encodings ([94e8c1b](https://github.com/streamich/json-joy/commit/94e8c1b5b514bba2c38ecf35ba0096ef6be965b2))
* 🎸 add array decoding ([39765c8](https://github.com/streamich/json-joy/commit/39765c85192831d41b1c45f5ce7f694d9e5ee5e3))
* 🎸 add array encoding ([a6feb74](https://github.com/streamich/json-joy/commit/a6feb74a69d179ac854527200c392273584d90ae))
* 🎸 add array encoding ([2bb9394](https://github.com/streamich/json-joy/commit/2bb9394200c45e48221686439fcd4c94cf3d51e4))
* 🎸 add array insert operation binary encoding ([1a1af91](https://github.com/streamich/json-joy/commit/1a1af91c3f59b2ecdae9f24489d9d53f93ad3d41))
* 🎸 add array type ([a029f38](https://github.com/streamich/json-joy/commit/a029f3825c9e8a455627cf8125e2deaf08038557))
* 🎸 add basic object insertions ([618462d](https://github.com/streamich/json-joy/commit/618462dce02dc67fc3c4f995014253ed3ae47c92))
* 🎸 add benchmarking ([2199b72](https://github.com/streamich/json-joy/commit/2199b724c2bf165a647c7a7d067fc4134b7e5482))
* 🎸 add binary decoding for delete operations ([dd168b6](https://github.com/streamich/json-joy/commit/dd168b6434b07039f26063460893bfb32533be60))
* 🎸 add binary encoding for deletion operation ([55bb035](https://github.com/streamich/json-joy/commit/55bb0354d078d33b5e1cb1fca2d931c27a6f55c8))
* 🎸 add binary number decoding ([dd39399](https://github.com/streamich/json-joy/commit/dd3939908d34390e1eef30ad9b80107a869f289a))
* 🎸 add binary string decodgin ([87e2118](https://github.com/streamich/json-joy/commit/87e2118754a7675b80cae2d3fd6b2060c52458b1))
* 🎸 add binary string encoding ([9cfdd35](https://github.com/streamich/json-joy/commit/9cfdd358f8222f184102e51b01ccf6b9caca20da))
* 🎸 add Binary-Rx header encoding ([251ba88](https://github.com/streamich/json-joy/commit/251ba88774f3da2b6df6d427bff92ffa8bfc4422))
* 🎸 add Binary-Rx message decoding ([0edeb3f](https://github.com/streamich/json-joy/commit/0edeb3f7b5e195a5aaa8a2bc47813cb4ffb7893d))
* 🎸 add binary-rx message types ([df0bb6e](https://github.com/streamich/json-joy/commit/df0bb6e6837e21f8d1e1b8f335810c2db7fa6b8d))
* 🎸 add Binary-Rx specification ([30dd435](https://github.com/streamich/json-joy/commit/30dd4357cf19f98773a90227609be023cc407b62))
* 🎸 add classes for JSON CRDT Patch patch and patch builder ([547c642](https://github.com/streamich/json-joy/commit/547c642b7879bfd3946c9222692b9cddd7b94aff))
* 🎸 add codec for negative integers ([afe35f8](https://github.com/streamich/json-joy/commit/afe35f83aef61d80f0a01636c123a0804df28e33))
* 🎸 add constant JSON value type ([78b6657](https://github.com/streamich/json-joy/commit/78b665744e952ef56b4672741daff3f389c868e1))
* 🎸 add constant type to compact operation encoding ([6ff3459](https://github.com/streamich/json-joy/commit/6ff3459f4fa12187b5cab78df4ab525f714bbbb6))
* 🎸 add decodeVarUint() function ([584e5f6](https://github.com/streamich/json-joy/commit/584e5f6e3182c57a6ab98cd94a9f9c153b0050a2))
* 🎸 add decoding for arraay ([83f4655](https://github.com/streamich/json-joy/commit/83f46558abc3ac9ccca39268b3c30ba3a5723d60))
* 🎸 add decoding for array insert operation ([95afbb2](https://github.com/streamich/json-joy/commit/95afbb27b147dc86ab01c4f482f5809eab3b2059))
* 🎸 add decoding for JSON CRDT Patch patches ([502bb0c](https://github.com/streamich/json-joy/commit/502bb0c1af2a0c96e1cd95a57564e4a018394673))
* 🎸 add decoding for object key set operation ([14d3168](https://github.com/streamich/json-joy/commit/14d316839bed49f76d92a80db01e95081cfe1017))
* 🎸 add doc.find() to find nodes by pointer ([187ac61](https://github.com/streamich/json-joy/commit/187ac61c1367a0ee078c86bb6455cb9db146b67b))
* 🎸 add Draft class ([1c77c32](https://github.com/streamich/json-joy/commit/1c77c329df492d1cc112c3de6faa26a635b19b5a))
* 🎸 add encoding for CompleteMessage ([8ebac17](https://github.com/streamich/json-joy/commit/8ebac1718245616b8d5c6ec0d3bb555ea9e41c71))
* 🎸 add encoding for DataMessage ([a27594d](https://github.com/streamich/json-joy/commit/a27594dedfbfb2731908af0014ec19048f016c86))
* 🎸 add extension codec ([60f13ba](https://github.com/streamich/json-joy/commit/60f13ba880414b37daf55df8af0f5d5cf56a7d79))
* 🎸 add findIdSpan() to array type ([c4ad173](https://github.com/streamich/json-joy/commit/c4ad17371a2ef241cb0fb9395ab4c33c27fd34ff))
* 🎸 add findIdSpan() to string type ([e1d5ce3](https://github.com/streamich/json-joy/commit/e1d5ce3d671e892e547fbba46e079ea0384e4ea6))
* 🎸 add float32 codec ([f95dbc1](https://github.com/streamich/json-joy/commit/f95dbc164c3009f6df9a37f9e6fffefcbc01d59c))
* 🎸 add full encoder class ([d78e792](https://github.com/streamich/json-joy/commit/d78e7929ae64b97235bac05c18de13bd5715fdaa))
* 🎸 add isFloat32() helper ([9f17969](https://github.com/streamich/json-joy/commit/9f179690e034e5d80a9099d6d0cc68face74379d))
* 🎸 add JSON codec types and encoder ([a02e36b](https://github.com/streamich/json-joy/commit/a02e36b13315659e2c38454591aaa680991458cc))
* 🎸 add JSON CRDT Patch compact decoder ([3a8d5d7](https://github.com/streamich/json-joy/commit/3a8d5d754eb3ea8212b27a83f188b6ab3e61cea6))
* 🎸 add JSON CRDT Patch types ([6f22aec](https://github.com/streamich/json-joy/commit/6f22aec22bc21abb2be1f285fbc334d2d4245d76))
* 🎸 add JSON-CRDT typings ([bb01b4a](https://github.com/streamich/json-joy/commit/bb01b4ad913521a90efe3f7065506d6543f3dd54))
* 🎸 add LogicalTimespan class ([15e155b](https://github.com/streamich/json-joy/commit/15e155bbeaede976a94a3b6ee787ee6e745a5d29))
* 🎸 add LWW object operations ([7f3665c](https://github.com/streamich/json-joy/commit/7f3665ccda46e696b09a27dcb7efcaecd20d2e6e))
* 🎸 add MakeConstatOperation class ([2d00909](https://github.com/streamich/json-joy/commit/2d009094dba5f3adb1ee2504ac0280fb36c9c55a))
* 🎸 add more test cases ([d1ada8b](https://github.com/streamich/json-joy/commit/d1ada8bc2d521008c7e6c97d65cff7174040829b))
* 🎸 add msgpack binary codec ([4965c51](https://github.com/streamich/json-joy/commit/4965c510fb1627b588027cfaaf51515a19664f28))
* 🎸 add number decoding ([2ea3efb](https://github.com/streamich/json-joy/commit/2ea3efb5198398bab1e8a75ed986d0ca4c02d9d5))
* 🎸 add number structural encoding ([5816133](https://github.com/streamich/json-joy/commit/58161335198d20419c787d8e0fe0f54e0fbc6e6d))
* 🎸 add number utilities ([28d8c07](https://github.com/streamich/json-joy/commit/28d8c070cb6f94153b01b564dba2af93f5cfc0b3))
* 🎸 add numSet() method to DocumentAPi ([9653ee2](https://github.com/streamich/json-joy/commit/9653ee209b68746e33e0aadf9213403cbb620486))
* 🎸 add obj key delete helper ([ac794be](https://github.com/streamich/json-joy/commit/ac794be7f53ad037f803af93f6f68e539b05d808))
* 🎸 add obj property to deletion in binary encoding ([4e4c0ae](https://github.com/streamich/json-joy/commit/4e4c0aefffc0d55df08ef17e8ab16c1a16d7c9e4))
* 🎸 add obj ref to del op in compact encoding ([4393faf](https://github.com/streamich/json-joy/commit/4393faf824223aef228da9ec10dbd0c92c533413))
* 🎸 add obj reference to compact JSON encoding ([70abb81](https://github.com/streamich/json-joy/commit/70abb81f3d4338347d77c7da0317873cd2ed8f47))
* 🎸 add obj_set operation binary encoding ([fa8d19c](https://github.com/streamich/json-joy/commit/fa8d19cfca33a5f384dbbe11b1392914aaead3d2))
* 🎸 add object api to DocumentApi ([891c39d](https://github.com/streamich/json-joy/commit/891c39d02a6c9962579493323a5e20c2c37efc6d))
* 🎸 add object decoding ([5b32fab](https://github.com/streamich/json-joy/commit/5b32fab5d7849a463472bfe2c3d22ca9fedc481c))
* 🎸 add object encoding ([5e90bcb](https://github.com/streamich/json-joy/commit/5e90bcbd1eae31862768a7459c1376a9f3ed8ada))
* 🎸 add object reference to delete operation ([539ed73](https://github.com/streamich/json-joy/commit/539ed73c38fd4d7718a08b3af61c7d3182b354d4))
* 🎸 add object reference to string insert operation ([b005297](https://github.com/streamich/json-joy/commit/b00529719dcc542e4dba2ee347da993f595ff340))
* 🎸 add padding in patch builder when clock jumps ([a610bca](https://github.com/streamich/json-joy/commit/a610bcafc470c459b3db8c4d623105a1ec39c678))
* 🎸 add patch noop operation, which simply skips IDs ([58fce94](https://github.com/streamich/json-joy/commit/58fce94bc7573129f806b9f2323df3458462bbb2))
* 🎸 add positive uint encodings ([464107e](https://github.com/streamich/json-joy/commit/464107e4d827623a3f21484c18d234b5d53ebccf))
* 🎸 add pre-computed value encoding ([31e2fac](https://github.com/streamich/json-joy/commit/31e2facd2114777e9858a31e7801ba915179eb0e))
* 🎸 add short string encoding ([3197454](https://github.com/streamich/json-joy/commit/31974545bd527b2d0e8a477fe5603e34b39bee56))
* 🎸 add string decoding ([f3fb93c](https://github.com/streamich/json-joy/commit/f3fb93c980b3f82739d5cfc9c5193f49aa1b63f6))
* 🎸 add string obj param to nominal JSON encoding ([9b99e1b](https://github.com/streamich/json-joy/commit/9b99e1bbdfc7953aa3d5f862603e713efff7a094))
* 🎸 add string obj reference to binary codec ([7489435](https://github.com/streamich/json-joy/commit/7489435017964e20b233ffe1d2020eb57fddbe9c))
* 🎸 add StringApi interface ([fe4b5f0](https://github.com/streamich/json-joy/commit/fe4b5f0a4dcdbbcc7248c340298991d361357c0b))
* 🎸 add support for "noop" op in basic JSON encoding ([5c6eff2](https://github.com/streamich/json-joy/commit/5c6eff2b20f95e636c5be77a8bb9850b4d2a80e2))
* 🎸 add support for as-is value ([27b60c1](https://github.com/streamich/json-joy/commit/27b60c1c879385c65d5eadae3ff486370610f44c))
* 🎸 add support for string operations ([e2aa213](https://github.com/streamich/json-joy/commit/e2aa213a4c82071856809523fb99250018287798))
* 🎸 add timestamp decoding functio ([2c90237](https://github.com/streamich/json-joy/commit/2c90237d75664d0022c2a20336d4dd3e9b1f40cf))
* 🎸 add toString() to document ([ba97de3](https://github.com/streamich/json-joy/commit/ba97de3ca0508d36fc09c7586c901586f3e238ba))
* 🎸 add v3 of decoder ([2a06782](https://github.com/streamich/json-joy/commit/2a067829ccb2791cb78a7471d714be648be7dea8))
* 🎸 adjust root and obj_set ops in compact encoding ([54d238a](https://github.com/streamich/json-joy/commit/54d238afe60130efa6fa3923c9a42e675f7d0eeb))
* 🎸 create dedicated document root type ([a980f0c](https://github.com/streamich/json-joy/commit/a980f0c46aab8ab4e511f4c4b09c9960e75c2abf))
* 🎸 do not emit object key size when in compact encoding ([1a56e64](https://github.com/streamich/json-joy/commit/1a56e6480c5fa5112c2bb3ea72d67b57a2d32b4b))
* 🎸 enable extension encoding ([b64c5da](https://github.com/streamich/json-joy/commit/b64c5da2d345eaec8913848cd66194bcee51fb91))
* 🎸 encode constants as a single number ([b6d6221](https://github.com/streamich/json-joy/commit/b6d62218297accdb93020096f48908ee82fb68de))
* 🎸 encode document in a tree way ([b04c823](https://github.com/streamich/json-joy/commit/b04c82384468b5c462c0889cc85adead4b046c6a))
* 🎸 encode num_set operation ([5089467](https://github.com/streamich/json-joy/commit/5089467174fb32b62708245f71c2342c38e9a7fb))
* 🎸 extend patch builder to construct any JSON value ([5abdf98](https://github.com/streamich/json-joy/commit/5abdf988f1a83ed5cd8da2ad0da03c21984a57ad))
* 🎸 find ID in array by index ([1dfc98e](https://github.com/streamich/json-joy/commit/1dfc98e6c66d445c549f0ed32de5d68654097afc))
* 🎸 find string char ID by inndex ([059f42f](https://github.com/streamich/json-joy/commit/059f42fa206325be4e15e272a8e548174e76ae99))
* 🎸 fix timestamp encoding ([f7e0aaf](https://github.com/streamich/json-joy/commit/f7e0aafd5f8d4599ae2ab096c6d85eef25ecbb05))
* 🎸 icrement time on operation application ([3f75c88](https://github.com/streamich/json-joy/commit/3f75c888716437b8a6771a0f533c3d08da2ab3a5))
* 🎸 implement array element deletion ([2b67c4b](https://github.com/streamich/json-joy/commit/2b67c4b237b740521ce096a719ea336f300a769d))
* 🎸 implement binary decoding for "noop" operation ([8589ba9](https://github.com/streamich/json-joy/commit/8589ba942890711e5ff66e32205c7292bd6f5b74))
* 🎸 implement Binary-Rx client ([30c3716](https://github.com/streamich/json-joy/commit/30c3716459e361621360f8112f8fb2b284c93f03))
* 🎸 implement Binary-Rx server controller ([459c3c8](https://github.com/streamich/json-joy/commit/459c3c8724b24f99f43ebe3fc54ce8cb42501423))
* 🎸 implement clock codec ([2caeb32](https://github.com/streamich/json-joy/commit/2caeb32bacded8e4b85e037ced2497da61d0fd60))
* 🎸 implement commit and flush for document api ([83a5aad](https://github.com/streamich/json-joy/commit/83a5aad5e51860b70e629a135001bdc96fdd666b))
* 🎸 implement compact JSON encoding ([8377d70](https://github.com/streamich/json-joy/commit/8377d70e0eb4d1987f6329464b69b27f7675d41a))
* 🎸 implement Decoder class ([7de2d23](https://github.com/streamich/json-joy/commit/7de2d23ffa332f664789769d0c5372b17d763292))
* 🎸 implement decoder with its own stack ([cae45fc](https://github.com/streamich/json-joy/commit/cae45fcbf6c698ca702bd7aecaef0e1f7aa3edb6))
* 🎸 implement encoder ([7dc195f](https://github.com/streamich/json-joy/commit/7dc195f5da808dd1fdf223f93b1a94c0ab6379b8))
* 🎸 implement JSON document root as LWW register ([cbb6a58](https://github.com/streamich/json-joy/commit/cbb6a58ce971852921e5135f5758bee839dfa910))
* 🎸 implement lww number type ([08bc48f](https://github.com/streamich/json-joy/commit/08bc48f8f4e314847b2ae31026500bdc5ecb2698))
* 🎸 implement LWW-Register ([c282006](https://github.com/streamich/json-joy/commit/c2820064ffee6a54b5ca629b17c00747c6063ce4))
* 🎸 implement MessagePack with Node native buffer copying ([f65bef8](https://github.com/streamich/json-joy/commit/f65bef8b0b1a72d7da638eff3e9b0e15d9404334))
* 🎸 implement v2 of decoder ([7c9c454](https://github.com/streamich/json-joy/commit/7c9c454fcf64d198fe4ed43b7aabcc2c1fd3b10f))
* 🎸 implement varuint8 utilities ([8dc1ebd](https://github.com/streamich/json-joy/commit/8dc1ebd6682a47ce48ee0ba77f50c29047f4d259))
* 🎸 improve .toJson() method ([29df33b](https://github.com/streamich/json-joy/commit/29df33b9b9702778c04b9a69e66420acc36c8d5a))
* 🎸 improve binary encoding ([1843b57](https://github.com/streamich/json-joy/commit/1843b57fc109a253488e6c5a154a2273275f31ee))
* 🎸 improve Binary-Rx server implementation and add tests ([7599958](https://github.com/streamich/json-joy/commit/7599958659658ca915c53ad2ff3782b6fcffe972))
* 🎸 improve encoding and add string codec ([98676ff](https://github.com/streamich/json-joy/commit/98676ff32d43991e5e0f912a5cb63461497fd289))
* 🎸 improve folder structure ([004afcb](https://github.com/streamich/json-joy/commit/004afcb92943ddba99589b5c83df480a35e2bead))
* 🎸 improve JSON CRDT Patch and JSON encoding ([b649caa](https://github.com/streamich/json-joy/commit/b649caabe3103214bf1ee81631c07aad04285308))
* 🎸 improve JSON-CRDT typings ([f92ed4f](https://github.com/streamich/json-joy/commit/f92ed4f0dd95f6d894510ea96ebbc4ef79ec552e))
* 🎸 improve ts overlap function ([5286546](https://github.com/streamich/json-joy/commit/52865460b3acb351463c1ba1a9ad757abc3bf66f))
* 🎸 improve vector clock ([425856a](https://github.com/streamich/json-joy/commit/425856a207ef419b1f9353b105cdc85f4a8161dc))
* 🎸 incode clock as string ([d706ac3](https://github.com/streamich/json-joy/commit/d706ac35bda0a3cba2073364b25702b9f47aa215))
* 🎸 make json pack encoder return Uint8Array ([e8102ef](https://github.com/streamich/json-joy/commit/e8102efacdd32bf1b80e2b05ddbd9ac3611b10a2))
* 🎸 merge array chunks ([099a073](https://github.com/streamich/json-joy/commit/099a073ee24db1a700edbee3a52fe09f6d92b3ce))
* 🎸 merge subsequent chunks in string type ([b9f6941](https://github.com/streamich/json-joy/commit/b9f694156375e5bc6df649a80b3cb07c33f0b7fb))
* 🎸 recursively delete deleted nodes ([f7911f9](https://github.com/streamich/json-joy/commit/f7911f9bb65239c5194c2f337315fab162e7deb5))
* 🎸 remove batch message ([bfee836](https://github.com/streamich/json-joy/commit/bfee836fc645bc821cceb9f888651d2bfe00e02e))
* 🎸 remove old root values ([7ac48c4](https://github.com/streamich/json-joy/commit/7ac48c4a3608ce79baabf912d1f29c8c9ea6a860))
* 🎸 resize encoder memory as needed ([2b11625](https://github.com/streamich/json-joy/commit/2b1162589d62956ed79e396871f68aa31ca620b1))
* 🎸 serialize the whole vector clock ([7b2d6df](https://github.com/streamich/json-joy/commit/7b2d6df74183900877d18a6a202fbf0d405a28f2))
* 🎸 set up string type ([d09e79d](https://github.com/streamich/json-joy/commit/d09e79d0f64525600709535eb93e7b1fd3577935))
* 🎸 setup exports from Binary-Rx ([c666b78](https://github.com/streamich/json-joy/commit/c666b78cd75b3275ce0d719e54b39f2771e448e5))
* 🎸 simplify root and obj_set ops in JSON encoding ([aa3556d](https://github.com/streamich/json-joy/commit/aa3556d90d0e1061d670eda8509a746b5ffb4d9c))
* 🎸 specify JSON CRDT Patch operations ([af68336](https://github.com/streamich/json-joy/commit/af68336f2dda031e6b2606ea378366beaa9eb744))
* 🎸 split array chunks when inserting in the mid of chunk ([64886d6](https://github.com/streamich/json-joy/commit/64886d676f7d5af9cd3510f218a7b1c340142198))
* 🎸 start clock encoder class ([5c1edbb](https://github.com/streamich/json-joy/commit/5c1edbb0d193aed43d5ed4d301cfd77ff660ad1a))
* 🎸 start implementation of ChangeBuffer ([4419bf5](https://github.com/streamich/json-joy/commit/4419bf5daa91ca98115b12dc057da74c1ef50293))
* 🎸 start implementing binary encoding ([06f3ebf](https://github.com/streamich/json-joy/commit/06f3ebfd8d2429873fdd490e914acd65da8ab15e))
* 🎸 start json-pack library ([4f76f6b](https://github.com/streamich/json-joy/commit/4f76f6b0f9f34ff363489d276d1e58e92ada9bdb))
* 🎸 start msgpack decoding ([f441f23](https://github.com/streamich/json-joy/commit/f441f23023dcc01ec7b720cac12e1d566b920c12))
* 🎸 start object type ([a8b584d](https://github.com/streamich/json-joy/commit/a8b584d4a4ea0057f649dfe86b59d708a74043d2))
* 🎸 start structural encoding ([86c3790](https://github.com/streamich/json-joy/commit/86c37908bbdad5074e241a6dca280e789211e532))
* 🎸 support basic insertions for array type ([6782a19](https://github.com/streamich/json-joy/commit/6782a19cf3afa9f8314d58bda0e4fa941d84a742))
* 🎸 support const type in nominal json encoding ([4b4f0c7](https://github.com/streamich/json-joy/commit/4b4f0c7550f0a743f1223b9b52d95f2d6021b002))
* 🎸 support object operations for JSON Patch "add" op ([469c382](https://github.com/streamich/json-joy/commit/469c3820305356df186d5fb62f1d6a1504afbba3))
* 🎸 support setting document root in JSON Patch "add" op ([c208181](https://github.com/streamich/json-joy/commit/c20818115f5edd7514f22134fd15b9b6a7a18e73))
* 🎸 update document class ([baa5c66](https://github.com/streamich/json-joy/commit/baa5c66b9e2e7b6ce5c9d3644bbaa03ca080fbe7))
* 🎸 upgrade TypeScript ([aa50357](https://github.com/streamich/json-joy/commit/aa5035718de3947a9126dc1359685d8fc75b9718))
* 🎸 use clock table in decoding ([63ad5a4](https://github.com/streamich/json-joy/commit/63ad5a4946e16b8e6af0b75e7c43f952cc861279))
* 🎸 use clock table to encode clocks ([dd83024](https://github.com/streamich/json-joy/commit/dd8302465322d58df106c328442976c273780df3))
* 🎸 use timespan collection when deleting chunks ([d4a549a](https://github.com/streamich/json-joy/commit/d4a549aae7a5d13ac5332d89b97db11ce212604d))


### Performance Improvements

* ⚡️ add decoding benchmark ([ab8da29](https://github.com/streamich/json-joy/commit/ab8da29c3b8984ca383f47e2adcc27338256cef3))
* ⚡️ add more MessagePack benchmarks ([8e27ca2](https://github.com/streamich/json-joy/commit/8e27ca273397a8adbf21b0d06cce15869c41a8e8))
* ⚡️ add msgpack benchmarks ([c8eb910](https://github.com/streamich/json-joy/commit/c8eb9105d5ab8e3d621d8bab5aef2e899501d161))
* ⚡️ add v5 of decoder ([fe13330](https://github.com/streamich/json-joy/commit/fe133308ab3e320d62d1994c9f0c865e5216c0ad))
* ⚡️ check perf with msgpack-javascript ([17efacb](https://github.com/streamich/json-joy/commit/17efacbc9524681d950aa7f8722b64ab49e67fee))
* ⚡️ implement fast v3 with growing Uint8Array ([a8c143f](https://github.com/streamich/json-joy/commit/a8c143fd9ff2441ff9b2fc051ef019951d5e2363))
* ⚡️ implement v2 of Encoder ([a13ba1f](https://github.com/streamich/json-joy/commit/a13ba1fe57a7f6f2daffda74c369f07ac7cbc881))
* ⚡️ improve array buffer perf ([4c493ad](https://github.com/streamich/json-joy/commit/4c493ad62d05a1de75372d05c896b25e10d78cd1))
* ⚡️ improve encoder performance ([fc4922b](https://github.com/streamich/json-joy/commit/fc4922b4a9e13c6e7feb82e72b2b107cd29bdc2d))
* ⚡️ improve small negative int encoding performance ([65ac84a](https://github.com/streamich/json-joy/commit/65ac84ab36a1846130908a9328fdeea7f15b9361))
* ⚡️ improve string encoding performance ([f3bf7ae](https://github.com/streamich/json-joy/commit/f3bf7ae67320649e7b1375ab79c4de32206cefd9))
* ⚡️ increase cached key size ([97fe82b](https://github.com/streamich/json-joy/commit/97fe82b0cc1b1881dfa1f4a25555cc1b456fc233))
* ⚡️ minor improvements to encoder ([5c07bac](https://github.com/streamich/json-joy/commit/5c07bac5960a38e677c8aa3050967c9a9fc5f24c))
* ⚡️ optimize type detection in encodign ([7ca2d94](https://github.com/streamich/json-joy/commit/7ca2d94d2c05640f8065ebee322acba26d90b224))
* ⚡️ represent local op nums in compact encoding with negnum ([bc20bfa](https://github.com/streamich/json-joy/commit/bc20bfad01b8cc10ef5e3eae9cba6a8e772fd7a4))
* ⚡️ try to improve string encoding performance ([6eb2d0d](https://github.com/streamich/json-joy/commit/6eb2d0d18c31025ee0cc7b3a4950d5c8f1bb63e6))

# [2.6.0](https://github.com/streamich/json-joy/compare/v2.5.3...v2.6.0) (2021-02-27)


### Features

* 🎸 move dependencies to peerDependencies ([d215b0b](https://github.com/streamich/json-joy/commit/d215b0ba4fc27c71eecdcaf99b3d03a0534bd435))

## [2.5.3](https://github.com/streamich/json-joy/compare/v2.5.2...v2.5.3) (2021-02-26)


### Bug Fixes

* 🐛 bump json-schema-serializer ([c413bc4](https://github.com/streamich/json-joy/commit/c413bc421410dbca311e944ba15a92f55111f8e7))

## [2.5.2](https://github.com/streamich/json-joy/compare/v2.5.1...v2.5.2) (2021-02-26)


### Bug Fixes

* relax node version requirement ([98b9f2a](https://github.com/streamich/json-joy/commit/98b9f2a92af00e18cb2d9009935aa0dbeb1b4b6a))

## [2.5.1](https://github.com/streamich/json-joy/compare/v2.5.0...v2.5.1) (2020-12-22)


### Bug Fixes

* 🐛 show expected and received test results ([ef1b382](https://github.com/streamich/json-joy/commit/ef1b3820e7f80b9f011c23628d21a808c6fd5869))

# [2.5.0](https://github.com/streamich/json-joy/compare/v2.4.0...v2.5.0) (2020-12-22)


### Bug Fixes

* 🐛 make json-joy pass json-patch-test CLI tests ([c796dd8](https://github.com/streamich/json-joy/commit/c796dd8f74099887f356500bb9517a161167c90c))


### Features

* 🎸 add JSON Predicate "contains" operation tests ([52f6214](https://github.com/streamich/json-joy/commit/52f621412081b5b4d114edc8beeb39d0bbf64f31))


### Performance Improvements

* ⚡️ report ns/op in main benchmark ([8a81531](https://github.com/streamich/json-joy/commit/8a81531891b9427bea91ab7cb683aecd52675d0b))

# [2.4.0](https://github.com/streamich/json-joy/compare/v2.3.6...v2.4.0) (2020-12-19)


### Bug Fixes

* 🐛 fix json-patch-tests tests ([0c7591c](https://github.com/streamich/json-joy/commit/0c7591c339102148f0aa2a56b0b91be7b81916d4))


### Features

* 🎸 improve CLI JSON patch tests ([19b2af7](https://github.com/streamich/json-joy/commit/19b2af7eb8a76f9b79e19b7016fd12ed8a90bec6))
* 🎸 improve JSON Patch tests ([b86a0ea](https://github.com/streamich/json-joy/commit/b86a0eaa9fee89fbe603e0a27c63408277891fcd))

## [2.3.6](https://github.com/streamich/json-joy/compare/v2.3.5...v2.3.6) (2020-12-19)


### Bug Fixes

* 🐛 don't fail test suite on invalid output ([f91576b](https://github.com/streamich/json-joy/commit/f91576bba0bd8281fbace09828d580c215f2c204))

## [2.3.5](https://github.com/streamich/json-joy/compare/v2.3.4...v2.3.5) (2020-12-18)


### Bug Fixes

* 🐛 move fast-deep-equal to dependencies ([59a8459](https://github.com/streamich/json-joy/commit/59a84594df79984a0c3cd59a7b42d04cf90fb285))

## [2.3.4](https://github.com/streamich/json-joy/compare/v2.3.3...v2.3.4) (2020-12-18)


### Bug Fixes

* 🐛 remove peer dependencies ([e8725aa](https://github.com/streamich/json-joy/commit/e8725aaa57fb74dfb322f3bde8b4951b79febc3e))

## [2.3.3](https://github.com/streamich/json-joy/compare/v2.3.2...v2.3.3) (2020-12-18)


### Bug Fixes

* 🐛 use binary paths in /bin folder ([0bfcf8f](https://github.com/streamich/json-joy/commit/0bfcf8f86647d2289fdffd1b199677fc353985a7))

## [2.3.2](https://github.com/streamich/json-joy/compare/v2.3.1...v2.3.2) (2020-12-18)


### Bug Fixes

* 🐛 used extensions in binary references ([39dea15](https://github.com/streamich/json-joy/commit/39dea155d46ade64a4cfee316324a07484fbdec4))

## [2.3.1](https://github.com/streamich/json-joy/compare/v2.3.0...v2.3.1) (2020-12-18)


### Bug Fixes

* 🐛 bump json-schema-serializer patch version ([a6f9cd8](https://github.com/streamich/json-joy/commit/a6f9cd8acae325f8d07802818f67e01fb6f56c73))

# [2.3.0](https://github.com/streamich/json-joy/compare/v2.2.0...v2.3.0) (2020-12-18)


### Features

* 🎸 add json-pointer binary to package ([a9c77f9](https://github.com/streamich/json-joy/commit/a9c77f94de4852a729dc5b12c5f22b4547a1c916))
* 🎸 add json-pointer CLI ([239da00](https://github.com/streamich/json-joy/commit/239da0034bc5638225790add19c30f1df4e5d0c8))
* 🎸 improve JSON Patch CLI testing ([942cf1b](https://github.com/streamich/json-joy/commit/942cf1bd509320338c8df2e62277c595987626e5))
* 🎸 improve json-pointer testing CLI ([498b0a8](https://github.com/streamich/json-joy/commit/498b0a8de63617d672a3e981b83fc9c45b489e6c))
* 🎸 improve json-pointer tests ([89bc2f6](https://github.com/streamich/json-joy/commit/89bc2f68907ccc96cb9a53798a8e65f27a868299))
* 🎸 normalize CLI tool names ([97a27eb](https://github.com/streamich/json-joy/commit/97a27eb46c102cc022859b9c50cc5dd9d2e81954))

# [2.2.0](https://github.com/streamich/json-joy/compare/v2.1.0...v2.2.0) (2020-12-12)


### Features

* 🎸 add test CLI tool docs ([0ea059c](https://github.com/streamich/json-joy/commit/0ea059c3b09defa25e69779e190c44abadaa26db))
* 🎸 add testing script ([3b68ea6](https://github.com/streamich/json-joy/commit/3b68ea686e12c234ec896f9b2899e2d3fc5c6766))

# [2.1.0](https://github.com/streamich/json-joy/compare/v2.0.1...v2.1.0) (2020-12-12)


### Features

* 🎸 add JSON Patch CLI script ([dabd4d8](https://github.com/streamich/json-joy/commit/dabd4d84760be52373178a2630486a6dd4341aa9))
* 🎸 add JSON Patch CLI target ([db058cc](https://github.com/streamich/json-joy/commit/db058cc1a0d9e0ec0bd8933cad08ae688afa4cae))

## [2.0.1](https://github.com/streamich/json-joy/compare/v2.0.0...v2.0.1) (2020-12-12)


### Performance Improvements

* ⚡️ update deps ([18d9b4e](https://github.com/streamich/json-joy/commit/18d9b4e8fd621d1bc74097dfea97058799c7b1f1))

# [2.0.0](https://github.com/streamich/json-joy/compare/v1.9.0...v2.0.0) (2020-10-23)


### Features

* 🎸 allow metadata on error object ([cb58bc3](https://github.com/streamich/json-joy/commit/cb58bc3fee2a7a9cf88d81a79f8919eccc43a9b6))
* 🎸 use strings for returned messages from server ([48fc97c](https://github.com/streamich/json-joy/commit/48fc97c093c435af756dc0a4fde10986eb7e2943))


### BREAKING CHANGES

* 🧨 JSON-Rx server now returns JSON serialized strings instead of POJO
messages

# [1.9.0](https://github.com/streamich/json-joy/compare/v1.8.0...v1.9.0) (2020-10-14)


### Features

* 🎸 add buffering to JsonRxServer ([18bc4d1](https://github.com/streamich/json-joy/commit/18bc4d15d74214cb1b00914128d227bd162eb1e1))

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
