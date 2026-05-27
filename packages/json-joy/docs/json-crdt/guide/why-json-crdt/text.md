`json-joy` JSON CRDT library allows you to sync data between multiple
clients in a real-time or in a local-first long offline sessions scenario.
It is designed to be used in a wide range of applications, from simple
collaborative text editors to complex multi-user applications. The
library does not prescribe any particular data structure or data
schema, you can use it to sync any JSON data.

Older collaborative editing libraries are based on OT (Operational
Transformation) algorithms, which require a central server among other
limitations. The central server requirement means that users cannot
collaborate peer-to-peer and cannot be offline for extended periods of
time, moreover the update throughput is limited due to the central server
bottleneck.

JSON CRDT specification uses the newer CRDT (Conflict-free Replicated
Data Type) approach, which does not have those limitations. `json-joy`
implements cutting edge CRDT algorithms for state synchronization, yet
all CRDT complexity is hidden behind a simple API.


## Standardized specification

Unlike other libraries---which work as black-boxes, `json-joy` implements
the [JSON CRDT specification][json-crdt-spec] which is currently the only formal protocol
that specifies how JSON data type should be implemented as a CRDT.

The JSON CRDT specification is open-source and available for everyone to
read and implement. It is designed to be simple and easy to understand,
yet it provides best in class performance and storage efficiency. JSON CRDT
is supplemented by the JSON CRDT Patch specification, which defines how
changes to JSON CRDT documents should be represented as a patch.

Internally JSON CRDT uses CBOR serialization format for raw data.

[json-crdt-spec]: /specs/json-crdt


## Reliability

`json-joy` aims to be the first production-ready JSON CRDT library. Hence,
big emphasis is put on testing and reliability. The library has over 10,000
unit test cases, thousands of which are CRDT specific tests. Besides unit
testing, real-life editing traces are executed during testing
to verify that the library works as expected in real-life scenarios.

Next to deterministic tests, `json-joy` also runs [three different fuzzers][fuzzing]
to detect any possible bugs in CRDT algorithms. The fuzzers are designed
to randomly generate millions of different editing traces and verify that
the collaboration works as expected (documents converge to the same state).

[fuzzing]: /blog/fuzz-testing-rga-crdt

The library is also tested for performance and storage efficiency.
`json-joy` employs numerous benchmarks, which test the performance and
storage efficiency of the library against other libraries. In fact, the
core RGA (text editing CRDT) algorithm is 100x faster than the closest
competitor.

The library also has no dependencies and is written in TypeScript.


## Highest performance

`json-joy` implements the fastest algorithms in the industry for the core
library parts. It is designed to be used in real-time for lag-free time travel
as well as to provide scalable performance with small memory footprint on the
server-side.

The implementation of the core [text editing CRDT algorithm is 100x faster
than `yjs` and 1,000x faster than `automerge`][bench], while also using less
memory. The overall performance is also benchmarked and monitored for
regressions.

[bench]: /blog/list-crdt-benchmarks

The performance of document serialization and deserialization is also
benchmarked and is multiple times faster than other libraries. The size
of the serialized documents is also smaller than other libraries in most
cases. For JSON/CBOR data serialization, `json-joy` implements [the fastest
JSON and CBOR codecs in the JavaScript ecosystem][codecs].

[codecs]: /blog/json-codec-benchmarks


## Type safety

For user data stored in CRDT documents, the library allows to annotate that
data with TypeScript types; which lets you use the data in a type-safe
manner and benefit from auto-completion and type checking.


## Serialization formats

The library provides various document and patch serialization formats.
Different formats are optimized for different use cases. There are
human-readable verbose JSON formats; as well as binary optimized formats,
which are smaller and faster to parse due to detailed bit packing.


## Design principles

The main design principle of `json-joy` is to provide a production-ready
library that is easy to use. Production-ready means that the library is
well tested, has best in class performance, and has best in class storage
efficiency.

Besides the main design goals, `json-joy` also provides a best-effort
support for developer experience, code bundle size, and type safety.
