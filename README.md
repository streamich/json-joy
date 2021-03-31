# json-joy

JSON utilities. In this package:

- `/json-pointer` &mdash; Implements utility for locating data using [__JSON Pointer__][json-pointer]. {[Docs ☕️](./docs/json-pointer.md)}
- `/json-patch` &mdash; Implements [__JSON Patch__][json-patch] operations. {[Docs 🍪](./docs/json-patch.md)}
  - Implements [__JSON Predicate__][json-predicate] operations.
  - Implements additional JSON Patch operations.
- `/json-patch-ot` &mdash; Implements *operational transformations* for JSON Patch operations.
- `/json-rx` &mdash; Implements server and client classes for [__JSON-Rx__][json-rx] protocol. {[Docs 🚬](./docs/json-rx.md)}
- `/json-rpc` &mdash; Implements server class for [__JSON-RPC 2.0__][json-rpc] protocol.
- `/json-pack` &mdash; Fastest [__MessagePack__](https://msgpack.org/index.html) codec implementation.  {[Docs 🚀](./src/json-pack/README.md)}
- `/json-cli` &mdash; CLI utilities. {[Docs ⛑](./docs/json-cli.md)}

[json-pointer]: https://tools.ietf.org/html/rfc6901
[json-patch]: https://tools.ietf.org/html/rfc6902
[json-predicate]: https://tools.ietf.org/id/draft-snell-json-test-01.html
[json-rx]: https://onp4.com/@vadim/p/gv9z33hjuo
[json-rpc]: https://www.jsonrpc.org/specification

## Benchmarks

`json-joy` is substantially faster than `fast-json-patch`.

```
node benchmarks/main.js 
json-joy (applyPatch) x 352,915 ops/sec ±1.50% (92 runs sampled)
json-joy (applyOps) x 1,057,787 ops/sec ±0.85% (90 runs sampled)
fast-json-patch x 318,250 ops/sec ±0.90% (92 runs sampled)
Fastest is json-joy (applyOps)
```

## License

[Unlicense](LICENSE) &mdash; public domain.
