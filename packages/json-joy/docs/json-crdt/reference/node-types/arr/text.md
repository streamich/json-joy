The Array `arr` nodes are Replicated Growable Array (RGA) sorted list
CRDTs, where each element in the list is another JSON CRDT node.

In `json-joy` the `arr` nodes are represented by the `ArrNode` and `ArrApi`
classes. The `ArrNode` is the internal representation of the node, and the `ArrApi`
class wraps the `ArrNode` and provides a convenience API for working with the
node and applying local changes.


## Working with `arr` nodes

For this example we will create a simple object which stores a list of tags.

```ts
const model = Model.withLogicalClock(1234); // 1234 is session ID

model.api.root({
  tags: ['big', 'small', 'red'],
});
```

If we inspect the view of our model, we can see the object with the `tags` list:

```ts
console.log(model.view());
// { tags: [ 'big', 'small', 'red' ] }
```

However, if we inspect the model, we can see that each tag string is wrapped in
a `StrNode` node. This is the default behavior of the builder, which creates
a nested `StrNode` node for each string.

```ts
console.log(model.root + '');
// RootNode 0.0
// └─ ObjNode 1234.1
//    └─ "tags"
//        └─ ArrNode 1234.2
//           └─ ArrChunk 1234.17!3 len:3
//              ├─ [0]: StrNode 1234.3 { "big" }
//              │       └─ StrChunk 1234.4!3 len:3 { "big" }
//              ├─ [1]: StrNode 1234.7 { "small" }
//              │       └─ StrChunk 1234.8!5 len:5 { "small" }
//              └─ [2]: StrNode 1234.13 { "red" }
//                      └─ StrChunk 1234.14!3 len:3 { "red" }
```

However, in this example we don't need the tag strings to be editable, for this
we can use the `konst` builder function to construct a constant `con` node for
each tag.

```ts
model.api.obj([]).set({
  tags: [konst('big'), konst('small'), konst('red')],
});
```

We still get the same view:

```ts
console.log(model.view());
// { tags: [ 'big', 'small', 'red' ] }
```

But the tags list now contains `con` nodes, instead of `str` nodes, this will
save us some space in the document.

```ts
console.log(model.root + '');
// RootNode 0.0
// └─ ObjNode 1234.1
//    └─ "tags"
//        └─ ArrNode 1234.22
//           └─ ArrChunk 1234.26!3 len:3
//              ├─ [0]: ConNode 1234.23 { "big" }
//              ├─ [1]: ConNode 1234.24 { "small" }
//              └─ [2]: ConNode 1234.25 { "red" }
```

By default, the builder has created a nested `ArrNode` node. However, we
normally don't need to work with the internal representation of the node, but
rather with the `ArrApi` wrapper class. Let's grab a reference to our `arr` node.

```ts
// Retrieve node at path ['tags'] as "arr" type.
const tags = model.api.arr(['tags']);

console.log(tags + '');
// ArrApi
// └─ ArrNode 1234.22
//    └─ ArrChunk 1234.26!3 len:3
//       ├─ [0]: ConNode 1234.23 { "big" }
//       ├─ [1]: ConNode 1234.24 { "small" }
//       └─ [2]: ConNode 1234.25 { "red" }
```

The `tags` variable is an instance of the `ArrApi` class. This class provides
a convenient API for working with the node and applying local changes.

The `arr` nodes allow to insert and delete elements from the array. Let's insert
a couple of new tags into our array:

```ts
tags.ins(1, [konst('medium'), konst('blue')]);

console.log(tags + '');
// ArrApi
// └─ ArrNode 1234.22
//    └─ ArrChunk 1234.32!2 len:5
//       ├─ [1]: ConNode 1234.30 { "medium" }
//       └─ [2]: ConNode 1234.31 { "blue" }
//       ← ArrChunk 1234.26!1 len:1
//         └─ [0]: ConNode 1234.23 { "big" }
//       → ArrChunk 1234.27!2 len:2
//         ├─ [3]: ConNode 1234.24 { "small" }
//         └─ [4]: ConNode 1234.25 { "red" }
```

Let's check the view:

```ts
console.log(tags.view());
// [ 'big', 'medium', 'blue', 'small', 'red' ]
```

We can also delete array elements. Let's delete a couple of tags:
string.

```ts
tags.del(2, 2);
console.log(tags + '');
// ArrApi
// └─ ArrNode 1234.22
//    └─ ArrChunk 1234.32!1 len:3
//       └─ [1]: ConNode 1234.30 { "medium" }
//       ← ArrChunk 1234.26!1 len:1
//         └─ [0]: ConNode 1234.23 { "big" }
//       → ArrChunk 1234.33!1 len:1 [1]
//         → ArrChunk 1234.27!1 len:1 [1]
//           → ArrChunk 1234.28!1 len:1
//             └─ [2]: ConNode 1234.25 { "red" }
```

Finally, we can verify that the changes have been propagated to the root of the
model.

```ts
console.log(model.view());
// { tags: [ 'big', 'medium', 'red' ] }
```


## The `ArrNode` class

`ArrNode` represents the internal read-only CRDT node, your interaction with
the `ArrNode` class should be limited to reading its data. To modify the value
of a `ArrNode` node, use the `ArrApi` class or the `.applyPatch()` method
of the `Model` class.

### `.id` property

Holds the logical timestamp of the node.

### `.view()` method

Returns the view of the node. When no changes are applied to the node, the view
returns an array object with the same identity, so it will be equal to the
previous self using the triple-equals `===` operator.

### `.toString()` method

Returns a human-readable string representation of the node.


## The `ArrApi` class

The `ArrApi` class is the main interface for interacting with
the `ArrNode` nodes. It allows to execute local modifications and to read
values of the node.

~~~jj.note
See auto generated [API reference][docs]

[docs]: https://streamich.github.io/json-joy/classes/json_crdt.ArrApi.html
~~~

### `.node` property

Holds a reference to the `ArrNode` node.

### `.ins(index, elements)` method

Inserts text at the given index. The `index` argument is a zero-based index
where to insert the text. The `elements` is a list of values to convert to CRDT
nodes and insert into the array.

### `.del(index, length)` method

Deletes text at the given index. The `index` argument is a zero-based index
where to start deleting the text. The `length` argument is a number of
elements to delete.

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
