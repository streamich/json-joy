# JSON Joy 🦄🌈

JSON utilities. Libraries for collaborative editing with OT and CRDT approaches.
This package consists of multiple self-contained libraries:

- `json-patch` &mdash; Implementation __JSON Patch+__ operations.
  - [Documentation 🚀](./src/json-patch/README.md)
    - [JSON Patch](./src/json-patch/docs/json-patch.md)
    - [JSON Predicate](./src/json-patch/docs/json-predicate.md)
    - [JSON Patch Extended](./src/json-patch/docs/json-patch-extended.md)
  - [Reference 🤖](https://streamich.github.io/json-joy/modules/json_patch.html)
- `json-patch-ot` &mdash; Implementation *Operational Transformations* for JSON Patch+ operations.
- `json-rx` &mdash; Implementation of [__JSON-Rx__][json-rx] protocol for server and browser.
  - [Documentation 🚀](./src/json-rx/README.md)
- `binary-rx` &mdash; Implementation of Binary-Rx protocol, a version of JSON-Rx.
  - [Documentation 🚀](./src/binary-rx/README.md)
- `json-rpc` &mdash; Implements server class for [__JSON-RPC 2.0__][json-rpc] protocol.
- `json-pack` &mdash; Fastest JavaScript __MessagePack__ codec implementation.
  - [Documentation 🚀](./src/json-pack/README.md)
- `json-pointer` &mdash; utilities for locating data in a JSON document using [__JSON Pointer__][json-pointer].
  - [Documentation 🚀](./src/json-pointer/README.md)
  - [Reference 🤖](https://streamich.github.io/json-joy/modules/json_pointer.html)
- `json-cli` &mdash; CLI utilities and functional testing suites.
  - [Documentation 🚀](./src/json-cli/README.md)
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

[Unlicense](LICENSE) &mdash; Apache 2.0.
