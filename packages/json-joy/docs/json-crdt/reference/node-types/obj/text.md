The Object `obj` nodes are last-write-wins CRDT maps which store key-value
pairs. Each key is a string and each value is a reference (logical timestamp) of
another JSON CRDT node.

In `json-joy` the `obj` nodes are represented by the `ObjNode` and `ObjApi`
classes. `ObjNode` is the internal representation of the node, and the `ObjApi`
class wraps the `ObjNode` and provides a convenient API for working with the
node and applying local changes.


## Working with `obj` nodes

For this example we first construct a new `Model` instance with three nested
`obj` nodes and modify the contents of one of the objects.

```ts
const model = Model.withLogicalClock(1234); // 1234 is session ID

// Three objects nested inside each other
model.api.root({
  foo: {
    bar: {
      x: 1,
      y: 2,
    },
  }
});
```

Let's inspect the model.

```ts
console.log(model.view());
// { foo: { bar: { x: 1, y: 2 } } }

console.log(model.root + '');
// RootNode 0.0
// └─ ObjNode 1234.1
//    └─ "foo"
//        └─ ObjNode 1234.2
//           └─ "bar"
//               └─ ObjNode 1234.3
//                  ├─ "x"
//                  │   └─ ConNode 1234.4 { 1 }
//                  └─ "y"
//                      └─ ConNode 1234.5 { 2 }
```

By default, the builder has created three nested `ObjNode` nodes, one for
each object. However, we normally don't need to work with the internal
representation of the node, but rather with the `ObjApi` wrapper class. Let's
grab a reference to the inner most object, using the `.api.obj()` method.

```ts
// Retrieve node at path ['foo', 'bar'] as "obj" type.
const bar = model.api.obj(['foo', 'bar']);

console.log(bar + '');
// ObjApi
// └─ ObjNode 1234.3
//    ├─ "x"
//    │   └─ ConNode 1234.4 { 1 }
//    └─ "y"
//        └─ ConNode 1234.5 { 2 }
```

The `bar` variable is an instance of the `ObjApi` class. This class provides
a convenient API for working with the node and applying local changes.

The `obj` nodes allow to overwrite existing values and to insert new key-value
pairs. Let's overwrite the `x` value and insert a new `z` value.

```ts
bar.set({
  x: 24,
  z: 42,
});

console.log(bar + '');
// ObjApi
// └─ ObjNode 1234.3
//    ├─ "x"
//    │   └─ ConNode 1234.10 { 24 }
//    ├─ "y"
//    │   └─ ConNode 1234.5 { 2 }
//    └─ "z"
//        └─ ConNode 1234.11 { 42 }
```

You can see that the `x` value has been overwritten and the `z` value has been
inserted. We can also verify that by printing the view of the `bar` object.

```ts
console.log(bar.view());
// { x: 24, y: 2, z: 42 }
```

The `obj` nodes also allow to delete key-value pairs. Let's delete the `y` value.

```ts
bar.del(['y']);

console.log(bar.view());
// { x: 24, z: 42 }
```

You can see from the above that the `y` key no longer appears in the view of the
`bar` object. However, internally a tombstone has been inserted into the `obj`
node in place of the deleted value.

```ts
console.log(bar + '');
// ObjApi
// └─ ObjNode 1234.3
//    ├─ "x"
//    │   └─ ConNode 1234.10 { 24 }
//    ├─ "y"
//    │   └─ ConNode 1234.13 { undefined }
//    └─ "z"
//        └─ ConNode 1234.11 { 42 }
```

Finally, we can verify that the changes have been propagated to the root of the
model.

```ts
console.log(model.view());
// { foo: { bar: { x: 24, z: 42 } } }
```


## The `ObjNode` class

`ObjNode` represents the internal read-only CRDT node, your interaction with
the `ObjNode` class should be limited to reading its data. To modify the value
of a `ObjNode` node, use the `ObjApi` class or the `.applyPatch()` method
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


## The `ObjApi` class

The `ObjApi` class is the main interface for interacting with
the `ObjNode` nodes. It allows to execute local modifications and to read
values of the node.

~~~jj.note
See auto generated [API reference][docs]

[docs]: https://streamich.github.io/json-joy/classes/json_crdt.ObjApi.html
~~~

### `.node` property

Holds a reference to the `ObjNode` node.

### `.set(map)` method

Sets new values of the node. The `map` argument is a plain JavaScript object
with key-value pairs.

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

