The constant `con` nodes store immutable atomic raw data. In `json-joy` the
`con` nodes are represented by the `ConNode` and `ConApi` classes.

The data which `con` nodes store can be one of:

- any JSON or CBOR value, which includes binary data;
- an `undefined` value;
- a logical timestmap.


## Working with `con` nodes

~~~jj.note
[Try this example][link] without installation on RunKit.

[link]: https://runkit.com/streamich/json-joy-json-crdt---con-node-type
~~~

When the initial root value of a document is set, the values of
LWW (last-write-win) nodes are set to to point to `ConNode` nodes, which
are created for basic primitives JSON types such as nulls, booleans, and numbers.
Below you can see that LWW object `ObjNode` keys are pointing to `ConNode` nodes,
which in turn hold raw basic primitive data.


```ts
const model = Model.withLogicalClock(1234); // session ID is 1234

model.api.root({
  num: 123,
  bool: true,
  nil: null,
});

console.log(model + '');
// Model
// ├─ RootNode 0.0
// │  └─ ObjNode 1234.1
// │     ├─ "num"
// │     │   └─ ConNode 1234.2 { 123 }
// │     ├─ "bool"
// │     │   └─ ConNode 1234.3 { true }
// │     └─ "nil"
// │         └─ ConNode 1234.4 { null }
// │
// └─ VectorClock 1234.7
```

By default, other data types, such as strings, objects, and arrays are not wrapped
into `ConNode` nodes, but instead are recursively converted into more complex CRDT nodes.
For example, strings are converted to `StrNode` nodes, objects to `ObjNode` nodes,
and arrays to `ArrNode` nodes.

```ts
model.api.root({
  str: 'hello',
  obj: { foo: 'bar' },
  arr: [1],
});

console.log(model + '');
// Model
// ├─ RootNode 0.0
// │  └─ ObjNode 1234.7
// │     ├─ "str"
// │     │   └─ StrNode 1234.8 { "hello" }
// │     │      └─ StrChunk 1234.9!5 len:5 { "hello" }
// │     ├─ "obj"
// │     │   └─ ObjNode 1234.14
// │     │      └─ "foo"
// │     │          └─ StrNode 1234.15 { "bar" }
// │     │             └─ StrChunk 1234.16!3 len:3 { "bar" }
// │     └─ "arr"
// │         └─ ArrNode 1234.20
// │            └─ ArrChunk 1234.23!1 len:1
// │               └─ [0]: ValNode 1234.22
// │                       └─ ConNode 1234.21 { 1 }
// │
// └─ VectorClock 1234.26

console.log(model.view());
// { str: 'hello', obj: { foo: 'bar' }, arr: [ 1 ] }
```

However, you can force `json-joy` to wrap any data type into a `ConNode` node by
using the `konst` helper function from the `json-crdt-patch` sub-library.

```ts
model.api.root({
  str: konst('hello'),
});

console.log(model + '');
// Model
// ├─ RootNode 0.0
// │  └─ ObjNode 1234.26
// │     ├─ "str"
// │     │   └─ ConNode 1234.27 { "hello" }
// │     ├─ "obj"
// │     │   └─ ConNode 1234.28 { {"foo":"bar"} }
// │     └─ "arr"
// │         └─ ConNode 1234.29 { [1] }
// │
// └─ VectorClock 1234.32

console.log(model.view());
// { str: 'hello', obj: { foo: 'bar' }, arr: [ 1 ] }
```

Notice that now all keys (including `str`, `obj`, and `arr`) are pointing to `ConNode`
nodes, which hold raw data values and cannot be edited. This is useful when you want
to store immutable data, or when using a value as an enum, or to save some space by
not creating complex CRDT nodes for data types which you know will never be edited.

The `con` constant nodes may store `undefined` value or a logical timestamp. The
`undefined` value is used to represent the absence of a value, and the logical
timestamp might be useful to store references to other CRDT nodes. When a logical
clock is stored as a value of a `con` node, it is automatically converted to a
`Timestamp` object and consumes less space when serialized.

```ts
model.api.root({
  undef: undefined,
  stamp: konst(new Timestamp(1234, 5678)),
});

console.log(model + '');
// Model
// ├─ RootNode 0.0
// │  └─ ObjNode 1234.32
// │     ├─ "undef"
// │     │   └─ ConNode 1234.33 { undefined }
// │     └─ "stamp"
// │         └─ ConNode 1234.34 { 1234.5678 }
// │
// └─ VectorClock 1234.37

console.log(model.view());
// { stamp: Timestamp { sid: 1234, time: 5678 } }
```

The best way to get a reference to a `con` constant node is by using the `.api.const()`
method. The method accepts a path at which to look for the node, and returns a
`ConApi` object, which holds a reference to the `ConNode` node.

```ts
model.api.root({
  foo: {
    bar: 42,
  }
});

const conApi = model.api.const(['foo', 'bar']);
console.log(conApi.view());
// 42

const con = conApi.node;
console.log(con.toString());
// ConNode 1234.39 { 42 }
```


## The `ConNode` class

### `.id` property

Holds the ID of the node.

### `.view()` method

Returns the raw data value of the node. The value is assumed to be immutable, you
should not modify it.

### `.toString()` method

Returns a human-readable string representation of the node.

~~~jj.note
See auto generated [API reference][docs]

[docs]: https://streamich.github.io/json-joy/classes/json_crdt.ConApi.html
~~~

## The `ConApi` class

### `.node` property

Holds the `ConNode` node.

### `.view()` method

Shorthand for `.node.view()`.

### `.toString()` method

Returns a human-readable string representation of the node.
