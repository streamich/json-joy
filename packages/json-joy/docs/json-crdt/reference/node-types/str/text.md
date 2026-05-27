The String `str` nodes are Replicated Growable Array (RGA) sorted list
CRDTs, where each element in the list is a text character.

In `json-joy` the `str` nodes are represented by the `StrNode` and `StrApi`
classes. `StrNode` is the internal representation of the node, and the `StrApi`
class wraps the `StrNode` and provides a convenience API for working with the
node and applying local changes.


## Working with `str` nodes

For this example we first construct a new `Model` instance with `str` node
inside of an object.

```ts
const model = Model.withLogicalClock(1234); // 1234 is session ID

model.api.root({
  text: 'hello',
});
```

Let's inspect the model.

~~~jj.aside
`json-joy` implement, what is called, block-wise RGA algorithm for strings. This
means individual characters are not stored as separate nodes, but rather as
chunks. One can see that our string `"hello"` is stored as a single `StrChunk`
chunk.
~~~

```ts
console.log(model.view());
// { text: 'hello' }

console.log(model.root + '');
// RootNode 0.0
// └─ ObjNode 1234.1
//    └─ "text"
//        └─ StrNode 1234.2 { "hello" }
//           └─ StrChunk 1234.3!5 len:5 { "hello" }
```

By default, the builder has created a nested `StrNode` node. However, we
normally don't need to work with the internal representation of the node, but
rather with the `StrApi` wrapper class. Let's grab a reference to our `str` node.

```ts
// Retrieve node at path ['text'] as "str" type.
const text = model.api.str(['text']);

console.log(text + '');
// StrApi
// └─ StrNode 1234.2 { "hello" }
//    └─ StrChunk 1234.3!5 len:5 { "hello" }
```

The `text` variable is an instance of the `StrApi` class. This class provides
a convenient API for working with the node and applying local changes.

The `str` nodes allow to insert and delete text from the string. Let's insert
some text into our string:

```ts
text.ins(5, ' world');

console.log(text + '');
// StrApi
// └─ StrNode 1234.2 { "hello world" }
//    └─ StrChunk 1234.10!6 len:11 { " world" }
//       ← StrChunk 1234.3!5 len:5 { "hello" }
```

Now our text is `"hello world"`. Note that the `StrNode` node has created a
new `StrChunk` chunk to store the new text. The `StrChunk` chunks are
linked together in a linked list.

We can also delete parts of the string. Let's delete the `"hello"` part of the
string.

```ts
text.del(0, 6);

console.log(text + '');
// StrApi
// └─ StrNode 1234.2 { "world" }
//    └─ StrChunk 1234.10!1 len:5 [1]
//       ← StrChunk 1234.3!5 len:0 [5]
//       → StrChunk 1234.11!5 len:5 { "world" }
```

Finally, we can verify that the changes have been propagated to the root of the
model.

```ts
console.log(model.view());
// { text: 'world' }
```


## The `StrNode` class

`StrNode` represents the internal read-only CRDT node, your interaction with
the `StrNode` class should be limited to reading its data. To modify the value
of a `StrNode` node, use the `StrApi` class or the `.applyPatch()` method
of the `Model` class.

### `.id` property

Holds the logical timestamp of the node.

### `.view()` method

Returns the view of the node. The value is cached, if no changes have been
applied to the node, the cached value is returned.

### `.toString()` method

Returns a human-readable string representation of the node.


## The `StrApi` class

The `StrApi` class is the main interface for interacting with
the `StrNode` nodes. It allows to execute local modifications and to read
values of the node.

~~~jj.note
See auto generated [API reference][docs]

[docs]: https://streamich.github.io/json-joy/classes/json_crdt.StrApi.html
~~~

### `.node` property

Holds a reference to the `StrNode` node.

### `.ins(index, text)` method

Inserts text at the given index. The `index` argument is a zero-based index
where to insert the text. The `text` argument is a string to insert.

### `.del(index, length)` method

Deletes text at the given index. The `index` argument is a zero-based index
where to start deleting the text. The `length` argument is a number of
characters to delete.

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
