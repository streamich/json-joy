Below we will create a simple JSON CRDT document and edit it using the
`model.api` API. We will also take a look at the internal representation of
the document and learn about the various CRDT node types.

~~~jj.note
[Try this example][link] without installation on RunKit.

[link]: https://runkit.com/streamich/json-joy-json-crdt-getting-started
~~~


## Creating a JSON CRDT document

To create a JSON CRDT document, you need to instantiate a `Model` object.
The *model* is a container for all the CRDT nodes and provides an API for
manipulating the document.

```ts
import {Model} from 'json-joy/es2020/json-crdt';

// Create a new JSON CRDT document.
const model = Model.withLogicalClock();
```

The *view* of the document is a plain JavaScript JSON value which is the end
user representation of the data, which is guaranteed to be consistent across
all the replicas.

```ts
console.log(model.view());
// undefined
```

As you can see, the view of an empty document is `undefined`.  We can also
take a peek at the internal representation of the document by converting it
to a string.

```ts
console.log(model + '');
// model
// ├─ root 0.0
// │  └─ con 0.0 { undefined }
// │
// └─ clock 1234.1
```

~~~jj.note
In CRDTs all nodes and other data is identified by a unique identifier, a logical
timestamp. A logical timestamp is a pair of session ID (user ID) and an
incrementing counter (sequence number). When you see labels like `0.0` or
`1234.1`, it just means those are the logical timestamps of the nodes, where
the first integer is the session ID and the second integer is the sequence
number.
~~~

One can see that an empty document is composed of a last-write-wins `val` root
node, which is pointing to a `con` constant node, which in turn holds the value
`undefined`.

When creating a new document, it is useful to specify the initial value of the
document before it is synchronized with other replicas. This can be done by
setting the root value of the document using the `.api.root()` utility.

~~~jj.aside
The root of the document can be any JSON value, it does not have to be an
object. Also, the value can be any JSON-like value, including `Uint8Array`
objects.
~~~

```ts
model.api.root({
  counter: 0,
  text: 'Hello',
});
```

Now the view of the document is what we expect it to be.

```ts
console.log(model.view());
// { counter: 0, text: 'Hello' }
```

And the internal representation of the document is a bit more complex.

```ts
console.log(model + '');
// model
// ├─ root 0.0
// │  └─ obj 1234.1
// │     ├─ "counter"
// │     │   └─ con 1234.2 { 0 }
// │     └─ "text"
// │         └─ str 1234.3 { "Hello" }
// │            └─ StrChunk 1234.4!5 len:5 { "Hello" }
// │
// └─ clock 1234.11
```

Let's unpack this a bit. The root node is still a last-write-wins `val` node,
but now is pointing to an `obj` object node, which also is a last-write-wins
node---every key-value pair is a last-write-wins register. The `counter` key
is pointing to a `con` constant node, which holds the value `0`. The `text`
key is pointing to a `str` string node, which is powered by the RGA (Replicated
Growable Array) algorithm, and currently holds the value `Hello`.


## Basic document editing

All changes to the document follow the JSON CRDT Patch specification and are
applied to the document using the `model.applyPatch()` method. However, there
are various convenience APIs built on top of the `applyPatch()` method, which
make it easier to edit the document. In this section we will use the built-in
`model.api` API to edit the document.

Let's set a new value for the `"counter"` key. For that, we need to get hold of
the object node at the root of the document and use that to set the new
value.

```ts
// Find "obj" object node at path [].
const obj = model.api.obj([]);

// Overwrite the "counter" last-write-wins register to 25.
obj.set({ counter: 25 });
```

Let's also edit the `"text"` key. For that, we need to get hold of the string
node at location `['text']` and use that to set the new value.

```ts
// Find "str" string node at path ['text'].
const str = model.api.str(['text']);

// Insert " world!" at index 5.
str.ins(5, ' world!');
```

Let's verify that the document has been updated.

```ts
console.log(model.view());
// { counter: 25, text: 'Hello world!' }
```

Let's also take a look at the internal representation of the document.

```ts
console.log(model + '');
// model
// ├─ root 0.0
// │  └─ obj 1234.1
// │     ├─ "counter"
// │     │   └─ con 1234.11 { 25 }
// │     └─ "text"
// │         └─ str 1234.3 { "Hello world!" }
// │            └─ StrChunk 1234.13!7 len:12 { " world!" }
// │               ← StrChunk 1234.4!5 len:5 { "Hello" }
// │
// └─ vector 1234.20
```


## Serialization and deserialization

Every model instance has the `.toBinary()` method, which serializes the
document into a binary format. The binary format can be used to transfer the
document between replicas, or to store it in a database.

```ts
const blob = model.toBinary();
console.log(blob);
// Uint8Array(52) [
//   1,   0,   0,   0,  38, 129,  18, 130, 167,  99,
// 111, 117, 110, 116, 101, 114,  24, 212,  25, 164,
// 116, 101, 120, 116, 129,  16, 162,  31, 165,  72,
// 101, 108, 108, 111,  22, 167,  32, 119, 111, 114,
// 108, 100,  33,   1,   0,   0,   4, 210,   0,   0,
//   0,  19
// ]
```

The `Model` class has a static `.fromBinary()` method, which can be used to
deserialize the document from a binary format. This effectively creates a
new model instance---a fork of the original document.

```ts
const fork = Model.fromBinary(blob);
console.log(fork + '');
// model
// ├─ root 0.0
// │  └─ obj 1234.1
// │     ├─ "counter"
// │     │   └─ con 1234.11 { 25 }
// │     └─ "text"
// │         └─ str 1234.3 { "Hello world!" }
// │            └─ StrChunk 1234.13!7 len:12 { " world!" }
// │               ← StrChunk 1234.4!5 len:5 { "Hello" }
// │
// └─ clock 1234.20
```

We can retrieve the JSON CRDT Patch operations which were applied to the
model while we were editing it. This can be done using the `.api.flush()`
method. The patch can also be cast to a string and printed, which is useful
for debugging.

```ts
const patch = model.api.flush();
console.log(patch + '');
// Patch 1234.1!19
// ├─ new_obj 1234.1
// ├─ new_con 1234.2 { 0 }
// ├─ new_str 1234.3
// ├─ ins_str 1234.4!5, obj = 1234.3 { 1234.3 ← "Hello" }
// ├─ ins_obj 1234.9!1, obj = 1234.1
// │   ├─ "counter": 1234.2
// │   └─ "text": 1234.3
// ├─ ins_val 1234.10!1, obj = 0.0, val = 1234.1
// ├─ new_con 1234.11 { 25 }
// ├─ ins_obj 1234.12!1, obj = 1234.1
// │   └─ "counter": 1234.11
// └─ ins_str 1234.13!7, obj = 1234.3 { 1234.8 ← " world!" }
```

Finally, patches also can be serialized into a binary format using the built-in
`.toBinary()` method. Once serialized, the patch can be transferred between
peers and applied using the `model.applyPatch()` method.

```ts
const patchBlob = patch.toBinary();
console.log(patchBlob);
// Uint8Array(64) [
//   210,   9,   1, 247,   9,   2,   0,   0,   4, 172, 131,
//   131,  72, 101, 108, 108, 111,  74, 129, 120,   7,  99,
//   111, 117, 110, 116, 101, 114, 130, 100, 116, 101, 120,
//   116, 131,   9,   0,   0, 129,   0,  24,  25,  42, 129,
//   120,   7,  99, 111, 117, 110, 116, 101, 114, 139, 236,
//   131, 136,  32, 119, 111, 114, 108, 100,  33
// ]
```
