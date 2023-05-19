[json-joy]: https://jsonjoy.com

<div align="center">
  <br />
  <br />
  <a href="https://jsonjoy.com">
      <img src="https://appsets.jsonjoy.com/branding/display/text-block/presentation-with-text.svg" alt="json-joy - JSON tools for real-time and collaborative apps" target="_blank" />
  </a>
  <br />
  <br />
</div>


# __json-joy__

[json-joy][json-joy] is dedicated to implementing cutting-edge real-time and
collaborative editing algorithms. Currently, our focus is on developing the
JSON CRDT protocol, a Conflict-free Replicated Data Type that enables seamless
merging of changes in JSON data models, avoiding conflicts between replicas.

Additionally, json-joy offers a collection of practical JSON utilities. These
utilities are designed as stand-alone mini-libraries, allowing you to leverage
them independently for your specific needs:

- [__`json-binary`__](./src/json-binary/README.md) &mdash; JSON serializer and parser with `Uint8Array` binary data support.
- [__`json-brand`__](./src/json-brand/README.md) &mdash; TypeScript *branded type* for JSON.
- [__`json-clone`__](./src/json-clone/README.md) &mdash; JSON deep cloning methods.
- [__`json-expression`__](./src/json-expression/README.md) &mdash; implementation of __JSON Expression__ language.
- [__`json-pack`__](./src/json-pack/README.md) &mdash; Fastest __CBOR__, __MessagePack__, and __UBJSON__ codecs in JavaScript.
- [__`json-equal`__](./src/json-equal/README.md) &mdash; Fastest JSON deep equal implementations in JavaScript.
- [__`json-patch`__](./src/json-patch/docs/json-patch.md) &mdash; Implementation of __JSON Patch+__ mutation operations.
- [__`json-pointer`__](./src/json-pointer/README.md) &mdash; utilities for locating data in a JSON document using [__JSON Pointer__][json-pointer].
- [__`json-cli`__](./src/json-cli/README.md) &mdash; CLI utilities and functional testing suites.
- [__`json-random`__](./src/json-random/README.md) &mdash; generate random JSON value.
- [__`json-size`__](./src/json-size/README.md) &mdash; calculate the size of serialized JSON object.
- [__`json-type`__](./src/json-type/README.md) &mdash; JSON schema builder.
- __`util`__ &mdash;
  - [__`base64`__](./src/util/base64/README.md) &mdash; fast isomorphic configurable Base64 encoder.

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
