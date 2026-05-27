The Value nodes `val` are last-write-wins CRDTs which store a single value.
The value is a reference (logical timestamp) of another JSON CRDT node.
In `json-joy` the `val` nodes are represented by the `ValNode` and `ValApi`
classes.


## Document root

The root of a JSON CRDT document is a special case of a `val` node (represented by the `RootNode` class),
which is initially set to a constant `con` node with a raw value of `undefined`.

```ts
const model = Model.withLogicalClock(1234); // 1234 is the session ID

console.log(model + '');
// Model
// ├─ RootNode 0.0
// │  └─ ConNode 0.0 { undefined }
// │
// └─ VectorClock 1234.1
```


## Working with `val` nodes

When setting the initial value of a document, the RGA array elements are pointing to `val` nodes,
which in turn hold references to `con` nodes. Below you can see that the RGA array `ArrNode` elements
are pointing to `ValNode` nodes, which in turn hold references to `ConNode` nodes.

```ts
model.api.root([42, 69]);

console.log(model + '');
// Model
// ├─ RootNode 0.0
// │  └─ ArrNode 1234.1
// │     └─ ArrChunk 1234.6!2 len:2
// │        ├─ [0]: ValNode 1234.3
// │        │       └─ ConNode 1234.2 { 42 }
// │        └─ [1]: ValNode 1234.5
// │                └─ ConNode 1234.4 { 69 }
// │
// └─ VectorClock 1234.9
```

This is useful because JSON CRDT RGA implementation allows only insertion and deletion for RGA array elements,
but not modification. However, the `val` nodes can be modified in-place, without creating a new node.
This allows to modify the value of an RGA array element without creating a new node.

Below we replace the first element 42 with 99.

```ts
model.api.val([0]).set(99);

console.log(model + '');
// Model
// ├─ RootNode 0.0
// │  └─ ArrNode 1234.1
// │     └─ ArrChunk 1234.6!2 len:2
// │        ├─ [0]: ValNode 1234.3
// │        │       └─ ConNode 1234.9 { 99 }
// │        └─ [1]: ValNode 1234.5
// │                └─ ConNode 1234.4 { 69 }
// │
// └─ VectorClock 1234.11
```


## The `ValNode` class

`ValNode` represents the internal read-only CRDT node, your interaction with the `ValNode` class
should be limited to reading its data. To modify the value of a `ValNode` node, use the `ValApi` class or
the `.applyPatch()` method of the `Model` class.

### `.id` property

Holds the logical timestamp of the node.

### `.view()` method

Returns the value of the node. The value is assumed to be immutable, you shall not modify it.

### `.toString()` method

Returns a human-readable string representation of the node.


## The `ValApi` class

The `ValApi` class is the main interface for interacting with the `ValNode` nodes. It allows to
execute local modifications and to read the value of the node.

~~~jj.note
See auto generated [API reference][docs]

[docs]: https://streamich.github.io/json-joy/classes/json_crdt.ValApi.html
~~~

### `.node` property

Holds a reference to the `ValNode` node.

### `.set()` method

Sets a new value of the node.

### `.view()` method

Shortcut for `.node.view()`.

### `.toString()` method

Returns a human-readable string representation of the node.

### `.events` property

The `.events` object allows to subscribe to events emitted by the node.

```ts
node.events.on('view', () => {
  console.log('Node view has changed');
});
```
