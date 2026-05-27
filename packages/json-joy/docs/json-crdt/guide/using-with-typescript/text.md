It is possible to strictly type the data stored in CRDT documents. We can
type annotate the internal data structure of the model, the library will
automatically compute the TypeScript type of the document view.

While strictly typing our internal document structure, we will also specify
the default value of the document. This will allow us to create a new
document with the default value applied.

To get started we need to import the schema builder `s` from
the `json-crdt-patch` sub-library. The helper object contains methods for
constructing every JSON CRDT node type (`s.con`, `s.obj`, `s.arr`, `s.str`,
`s.vec`, `s.bin`, `s.val`). Lets create a schema and the default value of
our document:


```ts
import {s} from 'json-joy/es2020/json-crdt-patch';

const schema = s.obj({
  text: s.con('hello'),
  counter: s.con(0),
  checked: s.con(true),
  friend: s.obj({
    name: s.con('John'),
    age: s.con(42),
    tags: s.arr([s.con('foo'), s.con('bar')]),
  }),
});
```

Now, when creating a new document we can use the `.setSchema()` method, which
will set the right TypeScript type of the `model` variable and also apply the default
value of the document. The default value is applied only if the document is
empty, otherwise the document is left untouched.

```ts
const model = Model.withLogicalClock(1234)
  .setSchema(schema);

console.log(model + '');
// Model
// ├─ RootNode 0.0
// │  └─ ObjNode 1234.1
// │     ├─ "text"
// │     │   └─ ConNode 1234.2 { "hello" }
// │     ├─ "counter"
// │     │   └─ ConNode 1234.3 { 0 }
// │     ├─ "checked"
// │     │   └─ ConNode 1234.4 { true }
// │     └─ "friend"
// │         └─ ObjNode 1234.5
// │            ├─ "name"
// │            │   └─ ConNode 1234.6 { "John" }
// │            ├─ "age"
// │            │   └─ ConNode 1234.7 { 42 }
// │            └─ "tags"
// │                └─ ArrNode 1234.8
// │                   └─ ArrChunk 1234.11!2 len:2
// │                      ├─ [0]: ConNode 1234.9 { "foo" }
// │                      └─ [1]: ConNode 1234.10 { "bar" }
// │
// └─ VectorClock 1234.16
```

We can now access the document view and it will be typed correctly:

```ts
console.log(model.view().friend.name);
// "John"
console.log(model.view().friend.tags[1]);
// "bar"
```

Also, the internal data structure of the model is typed correctly, and editor
auto-completion will work when accessing child elements using the `.get()` method:


```ts
console.log(model.api.node.get('text').view());
// "hello"
console.log(model.api.node.get('friend').get('name').view());
// "John"
```

~~~jj.note
Note, the `.setSchema()` method does two things:

1. It sets the TypeScript type annotations of the model node structure.
2. It sets the default value of the document, if the document is empty.
~~~
