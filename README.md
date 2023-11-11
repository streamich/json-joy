<div align="center">
  <br />
  <br />
  <a href="https://jsonjoy.com">
      <img src="https://appsets.jsonjoy.com/branding/avatars/avatar-256x256-fitted.svg" alt="json-joy - JSON tools for real-time and collaborative apps" target="_blank" />
  </a>
  <br />
  <br />
</div>


# json-joy

[![npm version](https://badge.fury.io/js/json-joy.svg)](https://badge.fury.io/js/json-joy)

[`json-joy`][json-joy] library implements cutting-edge real-time and
collaborative editing algorithms and other utilities for JSON data models.
Major focus of `json-joy` is development of the JSON CRDT protocol, a
Conflict-free Replicated Data Type that enables seamless
merging of changes in JSON data models, avoiding conflicts between replicas.

- [__Website__](https://jsonjoy.com)
- [__Documentation__](https://jsonjoy.com/libs/json-joy-js)
- [__Blog posts__](https://jsonjoy.com/blog)
  - [*Fuzz Testing RGA CRDT*](https://jsonjoy.com/blog/fuzz-testing-rga-crdt)
  - [*Benchmarking JSON Serialization Codecs*](https://jsonjoy.com/blog/json-codec-benchmarks)
  - [*List CRDT Benchmarks*](https://jsonjoy.com/blog/list-crdt-benchmarks)
  - [*Blazing Fast List CRDT*](https://jsonjoy.com/blog/performant-rga-list-crdt-algorithm)
- [__JSON CRDT__](https://jsonjoy.com/specs/json-crdt) `specification`
- [__JSON CRDT Patch__](https://jsonjoy.com/specs/json-crdt-patch) `specification`
- [__JSON Expression__](https://jsonjoy.com/specs/json-expression) `specification`
- [__JSON Reactive RPC__](https://jsonjoy.com/specs/json-rx) `specification`
- [__Compact JSON__](https://jsonjoy.com/specs/compact-json) `encoding`
- [__API Reference__](https://streamich.github.io/json-joy/)
- [__Test coverage__](https://streamich.github.io/json-joy/coverage/lcov-report/)


## Notable features

- Full JSON implementation as a CRDT (Conflict-free Replicated Datatype).
- The fastest list CRDT implementation in JavaScript.
- The fastest text OT (Operational Transformation) implementation in JavaScript.
- The fastest implementation of CBOR, DAG-CBOR, MessagePack, UBJSON, and JSON codecs in JavaScript.
- The fastest (HTTP) router implementation in JavaScript.
- The fastest JSON schema validation implementation in JavaScript.
- Very fast binary tree (Radix, AVL, Red-black*, Splay) implementations in JavaScript.
- Very fast JSON Patch (and JSON Pointer) implementation in JavaScript, including many non-standard operations, and JSON Predicate implementation.
- Very fast JSON Expression implementation in JavaScript.
- JSON Reactive RPC protocol (RPC with server push) implementation, for real-time collaborative apps.


[json-joy]: https://jsonjoy.com
