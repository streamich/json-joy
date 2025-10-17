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

- [**Website**](https://jsonjoy.com)
- [**Documentation**](https://jsonjoy.com/libs/json-joy-js)
- [**Blog posts**](https://jsonjoy.com/blog)
  - [_Collaborative Text Editors (Part 2): Plain Text Synchronization_](https://jsonjoy.com/blog/collaborative-text-sync-plain-text)
  - [_Collaborative Text Editors (Part 1): Prelude_](https://jsonjoy.com/blog/collaborative-text-sync-prelude)
  - [_Fuzz Testing RGA CRDT_](https://jsonjoy.com/blog/fuzz-testing-rga-crdt)
  - [_Benchmarking JSON Serialization Codecs_](https://jsonjoy.com/blog/json-codec-benchmarks)
  - [_List CRDT Benchmarks_](https://jsonjoy.com/blog/list-crdt-benchmarks)
  - [_Blazing Fast List CRDT_](https://jsonjoy.com/blog/performant-rga-list-crdt-algorithm)
- [**JSON CRDT**](https://jsonjoy.com/specs/json-crdt) `specification`
- [**JSON CRDT Patch**](https://jsonjoy.com/specs/json-crdt-patch) `specification`
- [**JSON Expression**](https://jsonjoy.com/specs/json-expression) `specification`
- [**JSON Reactive RPC**](https://jsonjoy.com/specs/json-rx) `specification`
- [**Compact JSON**](https://jsonjoy.com/specs/compact-json) `encoding`
- [**API Reference**](https://streamich.github.io/json-joy/)
- [**Test coverage**](https://streamich.github.io/json-joy/coverage/lcov-report/)

## Notable features

- Full JSON implementation as a CRDT (Conflict-free Replicated Datatype).
- The fastest list CRDT implementation in JavaScript.
- The fastest text OT (Operational Transformation) implementation in JavaScript.
- The fastest implementation of CBOR, DAG-CBOR, MessagePack, UBJSON, and JSON codecs in JavaScript.
- The fastest (HTTP) router implementation in JavaScript.
- The fastest JSON schema validation implementation in JavaScript.
- Very fast binary tree (Radix, AVL, Red-black\*, Splay) implementations in JavaScript.
- Very fast JSON Patch (and JSON Pointer) implementation in JavaScript, including many non-standard operations, and JSON Predicate implementation.
- Very fast JSON Expression implementation in JavaScript.

[json-joy]: https://jsonjoy.com
