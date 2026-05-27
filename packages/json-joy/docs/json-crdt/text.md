The `json-crdt` sub-library implements the [JSON CRDT specification][json-crdt-spec], which
is a distributed data structure that allows concurrent modifications and
merging of JSON documents.

Working with `json-crdt` is not much harder than working with plain JSON. It is
often faster than working with plain JSON, and stores only minimal amount of
metadata overhead.

[json-crdt-spec]: /specs/json-crdt
