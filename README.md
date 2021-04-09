# JSON Joy 🦄🌈

JSON utilities. Libraries for collaborative editing with OT and CRDT approaches.
This package consists of multiple self-contained libraries:

- __`json-pack`__ &mdash; Fastest __MessagePack__ codec implementation in JavaScript.
  - [__Documentation__ 🚀](./src/json-pack/README.md)
  - [__Reference__ 🤖](https://streamich.github.io/json-joy/modules/json_pack.html)
- __`json-patch`__ &mdash; Implementation of __JSON Patch+__ mutation operations.
  - [__Documentation__ 🚀](./src/json-patch/README.md)
    - [JSON Patch](./src/json-patch/docs/json-patch.md)
    - [JSON Predicate](./src/json-patch/docs/json-predicate.md)
    - [JSON Patch Extended](./src/json-patch/docs/json-patch-extended.md)
  - [__Reference__ 🤖](https://streamich.github.io/json-joy/modules/json_patch.html)
- __`json-patch-ot`__ &mdash; Implementation of *Operational Transformations* for JSON Patch+ operations.
  - __Documentation__ 🚀
  - __Reference__ 🤖
- __`json-crdt`__ &mdash; CRDT implementation for JSON type.
  - [__Documentation__ 🚀](./src/json-crdt/README.md)
  - __Reference__ 🤖
- __`json-crdt-patch`__ &mdash; JSON type CRDT operation specification and implementation.
  - __Documentation__ 🚀
  - __Specification__ 🤔
  - [Binary snapshot encoding 🧬](./src/json-crdt/codec/binary/README.md)
  - __Reference__ 🤖
- __`json-rx`__ &mdash; Implementation of [__JSON-Rx__][json-rx] protocol for server and browser.
  - [__Documentation__ 🚀](./src/json-rx/README.md)
  - __Specification__ 🤔
  - __Reference__ 🤖
- __`binary-rx`__ &mdash; Implementation of Binary-Rx protocol (binary version of JSON-Rx).
  - [__Documentation__ 🚀](./src/binary-rx/README.md)
  - __Specification__ 🤔
  - __Reference__ 🤖
- __`json-rpc`__ &mdash; Server implementation of [__JSON-RPC 2.0__][json-rpc] protocol.
  - __Documentation__ 🚀
  - __Reference__ 🤖
- __`json-pointer`__ &mdash; utilities for locating data in a JSON document using [__JSON Pointer__][json-pointer].
  - [__Documentation__ 🚀](./src/json-pointer/README.md)
  - [__Reference__ 🤖](https://streamich.github.io/json-joy/modules/json_pointer.html)
- __`json-cli`__ &mdash; CLI utilities and functional testing suites.
  - [__Documentation__ 🚀](./src/json-cli/README.md)
    - [`json-pack` CLI](./src/json-cli/docs/json-pack.md)
    - [`json-pointer` CLI](./src/json-cli/docs/json-pointer.md)
    - [`json-patch` CLI](./src/json-cli/docs/json-patch.md)
    - [`json-pointer-test` CLI](./src/json-cli/docs/json-pointer-test.md)
    - [`json-patch-test` CLI](./src/json-cli/docs/json-patch-test.md)

[json-pointer]: https://tools.ietf.org/html/rfc6901
[json-patch]: https://tools.ietf.org/html/rfc6902
[json-predicate]: https://tools.ietf.org/id/draft-snell-json-test-01.html
[json-rx]: https://onp4.com/@vadim/p/gv9z33hjuo
[json-rpc]: https://www.jsonrpc.org/specification


## Usage

To reduce your browser-side bundle size import directly from the library you use.

```ts
import from 'json-joy/{lib,es6,esm}/<library>';
```

For example:

```ts
import {applyOperations} from 'json-joy/lib/json-patch`;
```

All libraries can be imported from one of the below folders:

- `lib` &mdash; ES5 compiled CommonJS code.
- `es6` &mdash; ES6 compiled EcmaScript modules code.
- `esm` &mdash; latest TypeScript compiler supported EcmaScript modules code.


## License

[Apache 2.0](LICENSE)
