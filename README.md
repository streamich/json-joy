# JSON Joy 🦄🌈

JSON utilities. Libraries for collaborative editing with OT and CRDT approaches.
This package consists of multiple self-contained libraries:

- __`json-brand`__ &mdash; TypeScript *branded type* for JSON.
  - [__Documentation__ 🚀](./src/json-brand/README.md)
- __`json-expression`__ &mdash; implementation of __JSON Expression__ language.
  - [__Documentation__ 🚀](./src/json-expression/README.md)
- __`json-pack`__ &mdash; Fastest __MessagePack__ codec implementation in JavaScript.
  - [__Documentation__ 🚀](./src/json-pack/README.md)
  - [__Reference__ 🤖](https://streamich.github.io/json-joy/modules/json_pack.html)
- __`json-equal`__ &mdash; Fastest JSON deep equal implementations in JavaScript.
  - [__Documentation__ 🚀](./src/json-equal/README.md)
  - __Reference__ 🤖
- __`json-patch`__ &mdash; Implementation of __JSON Patch+__ mutation operations.
  - [__Documentation__ 🚀](./src/json-patch/README.md)
    - [JSON Patch](./src/json-patch/docs/json-patch.md)
    - [JSON Predicate](./src/json-patch/docs/json-predicate.md)
    - [JSON Patch Extended](./src/json-patch/docs/json-patch-extended.md)
  - [__Reference__ 🤖](https://streamich.github.io/json-joy/modules/json_patch.html)
- __`json-patch-ot`__ &mdash; Implementation of *Operational Transformations* for JSON Patch+ operations.
  - __Documentation__ 🚀
  - [__Reference__ 🤖](https://streamich.github.io/json-joy/modules/json_patch_ot.html)
- __`json-crdt`__ &mdash; CRDT implementation for JSON type.
  - [__Documentation__ 🚀](./src/json-crdt/README.md)
  - [__Reference__ 🤖](https://streamich.github.io/json-joy/modules/json_crdt.html)
- __`json-crdt-patch`__ &mdash; JSON type CRDT operation specification and implementation.
  - __Documentation__ 🚀
  - __Specification__ 🤔
  - [Binary snapshot encoding 🧬](./src/json-crdt/codec/binary/README.md)
  - [__Reference__ 🤖](https://streamich.github.io/json-joy/modules/json_crdt_patch.html)
- __`json-rx`__ &mdash; Implementation of [__JSON-Rx__][json-rx] protocol for server and browser.
  - [__Documentation__ 🚀](./src/json-rx/README.md)
  - __Specification__ 🤔
  - [__Reference__ 🤖](https://streamich.github.io/json-joy/modules/json_rx.html)
- __`binary-rx`__ &mdash; Implementation of Binary-Rx protocol (a binary version of JSON-Rx).
  - [__Documentation__ 🚀](./src/binary-rx/README.md)
  - __Specification__ 🤔
  - [__Reference__ 🤖](https://streamich.github.io/json-joy/modules/binary_rx.html)
- __`json-pointer`__ &mdash; utilities for locating data in a JSON document using [__JSON Pointer__][json-pointer].
  - [__Documentation__ 🚀](./src/json-pointer/README.md)
  - [__Reference__ 🤖](https://streamich.github.io/json-joy/modules/json_pointer.html)
- __`json-cli`__ &mdash; CLI utilities and functional testing suites.
  - [__Documentation__ 🚀](./src/json-cli/README.md)
    - [`json-pack` CLI](./src/json-cli/docs/json-pack.md)
    - [`json-unpack` CLI](./src/json-cli/docs/json-unpack.md)
    - [`json-pointer` CLI](./src/json-cli/docs/json-pointer.md)
    - [`json-patch` CLI](./src/json-cli/docs/json-patch.md)
    - [`json-pack-test` CLI](./src/json-cli/docs/json-pack-test.md)
    - [`json-pointer-test` CLI](./src/json-cli/docs/json-pointer-test.md)
    - [`json-patch-test` CLI](./src/json-cli/docs/json-patch-test.md)
- __`json-random`__ &mdash; generate random JSON value.
  - [__Documentation__ 🚀](./src/json-random/README.md)
- __`json-size`__ &mdash; calculate the size of serialized JSON object.
  - [__Documentation__ 🚀](./src/json-size/README.md)
- __`json-type`__ &mdash; JSON schema builder.
  - [__Documentation__ 🚀](./src/json-type/README.md)
- __`json-type-serializer`__ &mdash; fast `json-type` JSON and MessagePack serializer code generators.
  - [__Documentation__ 🚀](./src/json-type-serializer/README.md)
- __`json-type-validator`__ &mdash; fast `json-type` schema validator.
  - [__Documentation__ 🚀](./src/json-type-validator/README.md)
- __`util`__ &mdash;
  - __`base64`__ &mdash; fast isomorphic configurable Base64 encoder.
    - [__Documentation__ 🚀](./src/util/base64/README.md)

[json-pointer]: https://tools.ietf.org/html/rfc6901
[json-patch]: https://tools.ietf.org/html/rfc6902
[json-predicate]: https://tools.ietf.org/id/draft-snell-json-test-01.html
[json-rx]: https://onp4.com/@vadim/p/gv9z33hjuo


## Usage

To reduce your browser-side bundle size import directly from the library you use.

```ts
import from 'json-joy/{lib,es2020,es6,esm}/<library>';
```

For example:

```ts
import {deepEqual} from 'json-joy/lib/json-equal`;
```

All libraries can be imported from one of the below folders:

- `lib` &mdash; ES5 compiled CommonJS code.
- `es2020` &mdash; ES2020 compiled CommonJS code.
- `es6` &mdash; ES6 compiled CommonJS code.
- `esm` &mdash; latest TypeScript compiler supported EcmaScript modules code.


## Development

Run all tests locally:

```bash
yarn build
yarn test:all
```

Read more about testing in [Testing README](./src/__tests__/README.md).

Use [Angular-type semantic commit messages](https://www.conventionalcommits.org/en/v1.0.0-beta.4/)
for commit messages. Those are used in determining the version bump of the
library for the next release. Optional, you can use `git-cz` for that:

```bash
npx git-cz
```
