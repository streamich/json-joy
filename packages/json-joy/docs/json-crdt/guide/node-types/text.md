JSON CRDT documents are composed of seven different types of nodes. Each node
is itself a CRDT. The nodes are organized in a tree structure where container
nodes can have zero or more children, this way forming a JSON-like document
structure.

Each node has a unique identifier, which is a 2-tuple of session identifier and
a monotonically increasing counter. The IDs are referred to as logical timestamps.
Each CRDT node can be referenced by its ID.


## Node types

There are seven different types of nodes, each with its own purpose:

- `con` constant --- constant, an immutable value which holds raw JSON data.
- `val` value --- a reference to another CRDT node.
- `vec` vector --- a vector of references to other CRDT nodes.
- `obj` object --- a map of key-value pairs, each value is a reference to another CRDT node.
- `str` string --- an ordered list of text.
- `bin` binary --- an ordered list of binary data.
- `arr` array --- an ordered list of references to other CRDT nodes.


### `con` --- constant

The `con` node is a constant. It represents an immutable atomic value. It
can hold any JSON raw value, including complex JSON
types such as object and array. It also supports binary and undefined types from
CBOR. The `con` node can be used to create a raw constant value that can be
referenced by other nodes.

The `con` nodes are usually used to store primitive leaf values in the JSON
document, such as numbers, booleans, and nulls. However, it is also possible to
store complex JSON types such as strings, objects and arrays in the `con` node,
but those values cannot be modified, only replaced with a new value.


### `val` --- value

The `val` node represents a mutable value. It holds a reference to another
JSON CRDT node---the value of the `val` is an ID of another node. It stores only
one value, the value with the highest logical timestamp wins, if there were
concurrent updates.


### `vec` --- vector

The `vec` node represents a mutable vector. It holds a list of references to
other JSON CRDT nodes. The `vec` type is similar to the `val` type, but it
stores multiple values, up to 256 values.

More specifically, the `vec` node stores a list of index-value pairs. Where
index is a non-negative integer in the rage of 0 to 255, and value is a
reference to another JSON CRDT node. The `vec` node indexes do not have gaps,
usually `vec` nodes are constant size tuples, however, it is possible to
grow the `vec` node by appending new index-value pairs to the end of the
`vec` node.


### `obj` --- object

The `obj` node represents a mutable map of key-value pairs. It holds a list of
key-value pairs, where each key is a string and each value is a reference to
another JSON CRDT node.


### `str` --- string

The `str` node represents an ordered list of text characters. It is the basis
for collaborative text editing. The `str` node is a mutable array which allows
for concurrent insertions and deletions, where each element is a single
character.


### `bin` --- binary

The `bin` node represents an ordered list of binary octets. It is similar to the
`str` type, but it stores binary data instead of text.


### `arr` --- array

The `arr` node represents an array. Is is an ordered list of references to other
JSON CRDT nodes. Elements in the `arr` node can be inserted and deleted, it can
grow and shrink in size.


## Raw data nodes vs container nodes

JSON CRDT nodes can be divided into two categories: raw data nodes and container
nodes.

The raw data nodes are `con`, `str`, and `bin` nodes. They hold raw data
values which are immutable. `con` holds any JSON/CBOR value, `str` holds immutable
text characters, and `bin` holds immutable binary octets.

Container nodes are `val`, `vec`, `obj`, and `arr` nodes. They hold references
to other nodes and can be modified by adding or removing references to other
nodes.

This way the raw data nodes always appear at the leaves of the tree structure
and the container nodes are always at the inner nodes of the tree structure.


## `vec` vs `arr` nodes

The `vec` and `arr` nodes both represent a JSON array. When to use `vec` and
when to use `arr`? The best use case for `vec` is for small constant size
tuples, for example, when you want to save space by not using an object. Say,
instead of representing coordinates `{x: 1, y: 2}` as an object, you can
represent it as a tuple `[1, 2]` using a `vec` node. The `vec` node is more
compact than the `obj` node, because it does not need to store keys, only
indexes. Use `arr` node for all other cases, when you would use a JSON array.
Unlike `vec`, the `arr` nodes can grow and shrink in size, and new elements
can be inserted between two other existing elements.
