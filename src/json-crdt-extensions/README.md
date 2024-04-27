# JSON CRDT Extensions

_JSON CRDT Extensions_ are higher-order data types which build on top of the
JSON CRDT. For example, an extension data type can be composed of multiple
JSON CRDT nodes.

Some examples of extensions:

- Multi-value register - implemented as an RGA array.
- Append-only set - implemented as an RGA array.
- Ordered oplop - implemented as an RGA array.
- Quill Delta - implemented as an RGA string and an append-only set.
- Peritext - implemented as an RGA string and append-only sets.
