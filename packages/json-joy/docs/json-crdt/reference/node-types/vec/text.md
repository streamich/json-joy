The Vector `vec` nodes are last-write-wins CRDT vectors which store index-value
pairs. Each index is an integer and each value is a reference (logical timestamp) of
another JSON CRDT node.

In `json-joy` the `vec` nodes are represented by the `VecNode` and `VecApi`
classes. `VecNode` is the internal representation of the node, and the `VecApi`
class wraps the `VecNode` and provides a convenient API for working with the
node and applying local changes.


## Working with `vec` nodes

For this example we first construct a new `Model` instance with `vec` node
nested inside of a couple of objects. To create a `vec` node, use the `vec()`
helper function:

```ts
import {vec} from 'json-joy/es2020/json-crdt-patch';

const model = Model.withLogicalClock(1234); // 1234 is session ID

model.api.root({
  foo: {
    bar: vec(1, 2),
  }
});
```

Let's inspect the model.

```ts
console.log(model.view());
// { foo: { bar: [ 1, 2 ] } }

console.log(model.root + '');
// RootNode 0.0
// └─ ObjNode 1234.1
//    └─ "foo"
//        └─ ObjNode 1234.2
//           └─ "bar"
//               └─ VecNode "vec" 1234.3
//                  ├─ 0: ConNode 1234.4 { 1 }
//                  └─ 1: ConNode 1234.5 { 2 }
```

By default, the builder has created a nested `VecNode` node. However, we
normally don't need to work with the internal representation of the node, but
rather with the `VecApi` wrapper class. Let's grab a reference to our `vec` node.

```ts
// Retrieve node at path ['foo', 'bar'] as "vec" type.
const bar = model.api.vec(['foo', 'bar']);

console.log(bar + '');
// VecApi
// └─ VecNode "vec" 1234.3
//    ├─ 0: ConNode 1234.4 { 1 }
//    └─ 1: ConNode 1234.5 { 2 }
```

The `bar` variable is an instance of the `VecApi` class. This class provides
a convenient API for working with the node and applying local changes.

The `vec` nodes only allow to overwrite existing values and add new values to
the end of the vector (up to 256 total elements). Let's overwrite the first
element and insert a new one at the end.

```ts
bar.set([
  [0, 24],
  [2, 42],
]);

console.log(bar + '');
// VecApi
// └─ VecNode "vec" 1234.3
//    ├─ 0: ConNode 1234.10 { 24 }
//    ├─ 1: ConNode 1234.5 { 2 }
//    └─ 2: ConNode 1234.11 { 42 }
```

You can see that the first value was replaced by `24` and a new `42` value was
appended to the end. We can also verify that by printing the view of the `bar` node.

```ts
console.log(bar.view());
// [ 24, 2, 42 ]
```

Finally, we can verify that the changes have been propagated to the root of the
model.

```ts
console.log(model.view());
// { foo: { bar: [ 24, 2, 42 ] } }
```


## The `VecNode` class

`VecNode` represents the internal read-only CRDT node, your interaction with
the `VecNode` class should be limited to reading its data. To modify the value
of a `VecNode` node, use the `VecApi` class or the `.applyPatch()` method
of the `Model` class.

### `.id` property

Holds the logical timestamp of the node.

### `.view()` method

Returns the view of the node. The value is assumed to be immutable, you shall
not modify it.

The view value preserves object identity if possible. This allows you to
use `===` triple-equals operator to compare the values. This can be very useful
when working with UI frameworks such as React, as you can memoize the view value
and avoid unnecessary re-renders.

### `.toString()` method

Returns a human-readable string representation of the node.


## The `VecApi` class

The `VecApi` class is the main interface for interacting with
the `VecNode` nodes. It allows to execute local modifications and to read
values of the node.

~~~jj.note
See auto generated [API reference][docs]

[docs]: https://streamich.github.io/json-joy/classes/json_crdt.VecApi.html
~~~

### `.node` property

Holds a reference to the `VecNode` node.

### `.set(tuples)` method

Sets new values of the node. The `tuples` argument is a list of index-value
2-tuples.

### `.del(list)` method

Deletes values from the node. The `list` argument is a list of keys to delete.

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
