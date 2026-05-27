In JSON CRDT a unit of storage and exchange is a document. Each document represents
a single JSON value (which be can have any shape) and the metadata necessary to
synchronize it with other documents. The JSON value of the document used by
end-user applications is called the *view*, but the underlying metadata structures
are called the *model*.

The model is a tree of nodes, each node is a CRDT, hence the whole model is a CRDT.
Some nodes store raw JSON values, some nodes store references to other nodes.

Below we describe the model in detail. The `Model` class is the main class that
represents the model. The `ModelApi` class is a helper class that provides
convenience methods for applying local changes to the model.


## The `Model` class

~~~jj.note
See auto generated [API reference][docs]

[docs]: https://streamich.github.io/json-joy/classes/json_crdt.Model.html
~~~

### `.withLogicalClock()` static method

Creates a new model with a give session ID to be used for the logical clock. If
omitted, a random session ID is generated.

Session ID is a 53-bit unsigned integer. The first 65,535 session IDs are
reserved for internal use, use session IDs starting from 65,536.

### `.fromBinary()` static method

Unpacks a model from a binary representation, from a `Uint8Array`.

### `.view()` method

Returns the JSON value of the document. It preserves object identity where possible.
For example, if some object has not changed since the last time `.view()` was called,
the same object will be returned. It also caches the materialized view of strings.

### `.toBinary()` method

Packs the model into a binary representation. Returns a `Uint8Array`.

### `.applyPatch()` method

Applies a patch to the model. Receives a single `Patch` object. The patch must
be a valid JSON CRDT Patch.

### `.api` property

Returns an instance of the `ModelApi` class.

### `.toString()` method

Returns a string representation of the model. Useful for debugging.


## The `ModelApi` class

~~~jj.note
See auto generated [API reference][docs]

[docs]: https://streamich.github.io/json-joy/classes/json_crdt.ModelApi.html
~~~

### `.builder` property

Returns the reference to the `PatchBuilder` instance, which is used to build
patches to be applied to the model.

### `.events` property

Returns the reference to the `Emitter` object, used to subscribe to `"change"` events.

### `.con(path)` method

Returns a reference to a `con` node at a given path. If the node does not exist
or is not a `con` node, throws an error. The `path` argument is an array of
steps, where each step is either a string or a number.

### `.val(path)` method

Returns a reference to a `val` node at a given path. If the node does not exist
or is not a `val` node, throws an error. The `path` argument is an array of
steps, where each step is either a string or a number.

### `.vec(path)` method

Returns a reference to a `vec` node at a given path. If the node does not exist
or is not a `vec` node, throws an error. The `path` argument is an array of
steps, where each step is either a string or a number.

### `.obj(path)` method

Returns a reference to a `obj` node at a given path. If the node does not exist
or is not a `obj` node, throws an error. The `path` argument is an array of
steps, where each step is either a string or a number.

### `.str(path)` method

Returns a reference to a `str` node at a given path. If the node does not exist
or is not a `str` node, throws an error. The `path` argument is an array of
steps, where each step is either a string or a number.

### `.bin(path)` method

Returns a reference to a `bin` node at a given path. If the node does not exist
or is not a `bin` node, throws an error. The `path` argument is an array of
steps, where each step is either a string or a number.

### `.arr(path)` method

Returns a reference to a `arr` node at a given path. If the node does not exist
or is not a `arr` node, throws an error. The `path` argument is an array of
steps, where each step is either a string or a number.

### `.view()` method

Returns the JSON value of the document.

### `.flush()` method

Flushes all pending changes to the model. Returns a patch of changes.

### `.root(pojo)` method

Sets the root of the model to a given POJO. The POJO must be a valid JSON value,
but also `Uint8Array` values are allowed. All POJO nodes are converted to CRDT
equivalents. For example, strings are converted to `str` nodes, arrays are
converted to `arr` nodes, etc.
