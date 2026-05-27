The main goal of a collaborative editing library is to allow multiple users to
edit the same document concurrently, but once the users are done editing, the
document should converge to the same state on all devices.

In this section we will see how to achieve this with JSON CRDT. Below we will
create a document which will be edited by two users concurrently. The users will
then exchange patches and apply them to their documents. The documents will
converge to the same state.

We start by creating a new document and setting its initial state.

```ts
import {Model} from 'json-joy/es2020/json-crdt';
import {Patch} from 'json-joy/es2020/json-crdt-patch';

// Start a new document
const user1 = Model.withLogicalClock();

// Set the initial state of the document
user1.api.root({
  format: 'markdown',
  text: 'Hello!',
});

console.log(user1.view());
// {format: "markdown", text: "Hello!"}
```

Now we serialize the document and send it to another user. The other user loads
the document and creates a "fork" of it, so that a new session ID is assigned.

```ts
// Serialize the document and send it to another user
const blob = user1.toBinary();

// The other user loads the document and creates a "fork"
// of it, so that a new session ID is assigned
const user2 = Model.fromBinary(blob).fork();
```

Both users can now edit the document concurrently. Let's insert some text at the
same position. We will insert the texts "Alice" and "Charlie" at the same
position. The documents will diverge.

```ts
// Now both users insert concurrently some text at
// the same position
user1.api.str(['text']).ins(5, ' Alice');
user2.api.str(['text']).ins(5, ' Charlie');

// We now verify that documents of both users are different
console.log(user1.view()); // {format: "markdown", text: "Hello Alice!"}
console.log(user2.view()); // {format: "markdown", text: "Hello Charlie!"}
```

Users can now compute the patches of their changes and exchange them. The
patches can be applied to the documents of the other users. The documents will
converge to the same state.

```ts
// Users can now compute the patches of their changes
const patch1 = user1.api.flush().toBinary();
const patch2 = user2.api.flush().toBinary();

// Users can exchange patches and apply them
user1.applyPatch(Patch.fromBinary(patch2));
user2.applyPatch(Patch.fromBinary(patch1));
```

Let's verify that the documents of both users are now the same.

```ts
// Now both documents converge to the same state
console.log(user1.view()); // {format: "markdown", text: "Hello Charlie Alice!"}
console.log(user2.view()); // {format: "markdown", text: "Hello Charlie Alice!"}
```

This is the gist of CRTDs. As soon as two users apply the same patches, their
documents will converge to the same state, regardless of the order in which the
patches were applied.

~~~jj.note
[Try this example][link] without installation on RunKit.

[link]: https://runkit.com/streamich/json-joy-json-crdt-two-concurrent-users
~~~
