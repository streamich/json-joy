The Binary `bin` nodes are Replicated Growable Array (RGA) sorted list
CRDTs, where each element in the list is a binary octet (8-bit byte).

In `json-joy` the `bin` nodes are represented by the `BinRga` and `BinApi`
classes. `BinRga` is the internal representation of the node, and the `BinApi`
class wraps the `BinRga` and provides a convenience API for working with the
node and applying local changes.


## Working with `bin` nodes

For this example we first construct a new `Model` instance with a `bin` node
inside of an object.

```ts
const model = Model.withLogicalClock(1234); // 1234 is session ID

model.api.root({
  blob: new Uint8Array([1, 2, 3]),
});
```

Let's inspect the model.

~~~jj.aside
`json-joy` implement, what is called, block-wise RGA algorithm. This
means individual elements are not stored as separate nodes, but rather as
chunks.
~~~

```ts
console.log(model.view());
// { blob: Uint8Array(3) [ 1, 2, 3 ] }

console.log(model.root + '');
// RootNode 0.0
// └─ ObjNode 1234.1
//    └─ "blob"
//        └─ BinNode "bin" 1234.2  { 1, 2, 3 }
//           └─ BinChunk 1234.3!3 len:3 { 1, 2, 3 }
```

By default, the builder has created a nested `BinRga` node. However, we
normally don't need to work with the internal representation of the node, but
rather with the `BinApi` wrapper class. Let's grab a reference to our `bin` node.

```ts
// Retrieve node at path ['blob'] as "bin" type.
const blob = model.api.bin(['blob']);

console.log(blob + '');
// BinApi
// └─ BinRga 1234.2  { 1, 2, 3 }
//    └─ BinChunk 1234.3!3 len:3 { 1, 2, 3 }
```

The `blob` variable is an instance of the `BinApi` class. This class provides
a convenient API for working with the node and applying local changes.

The `bin` nodes allow to insert and delete text from the blob. Let's insert
some octets into our blob.

```ts
blob.ins(3, new Uint8Array([4, 5]));

console.log(blob + '');
// BinApi
// └─ BinRga 1234.2  { 1, 2, 3, 4, 5 }
//    └─ BinChunk 1234.8!2 len:5 { 4, 5 }
//       ← BinChunk 1234.3!3 len:3 { 1, 2, 3 }
```

We can also delete parts of the blob. Let's delete a byte in the middle of our
blob.

```ts
blob.del(2, 1);

console.log(blob + '');
// BinApi
// └─ BinRga 1234.2  { 1, 2, 4, 5 }
//    └─ BinChunk 1234.8!2 len:4 { 4, 5 }
//       ← BinChunk 1234.3!2 len:2 { 1, 2 }
//         → BinChunk 1234.5!1 len:0 [1]
```

Finally, we can verify that the changes have been propagated to the root of the
model.

```ts
console.log(model.view());
// { blob: Uint8Array(4) [ 1, 2, 4, 5 ] }
```


## The `BinRga` class

`BinRga` represents the internal read-only CRDT node, your interaction with
the `BinRga` class should be limited to reading its data. To modify the value
of a `BinRga` node, use the `BinApi` class or the `.applyPatch()` method
of the `Model` class.

### `.id` property

Holds the logical timestamp of the node.

### `.view()` method

Returns the view of the node. The value is cached, if no changes have been
applied to the node, the cached value is returned.

### `.toString()` method

Returns a human-readable string representation of the node.


## The `BinApi` class

The `BinApi` class is the main interface for interacting with
the `BinRga` nodes. It allows to execute local modifications and to read
values of the node.

~~~jj.note
See auto generated [API reference][docs]

[docs]: https://streamich.github.io/json-joy/classes/json_crdt.BinApi.html
~~~

### `.node` property

Holds a reference to the `BinRga` node.

### `.ins(index, uint8)` method

Inserts binary data at the given index. The `index` argument is a zero-based index
where to insert the text. The `uint` argument is an instance of `Uint8Array`.

### `.del(index, length)` method

Deletes octets at the given index. The `index` argument is a zero-based index
where to start deleting the text. The `length` argument is a number of octets to
delete.

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
