The `json-crdt-patch` sub-library of `json-joy` implements various utilities to construct and
work with JSON CRDT Patch objects. JSON CRDT Patch is a specification which defines
how changes to JSON CRDT objects are represented.

## Logical Clock

All operations in JSON CRDT Patch and all objects and their contents in JSON CRDT
are identified by a logical clock timestamps. A *logical clock timestamp* is a 2-tuple of a unique *session ID*
and a sequence counter *time*. The *session ID* is a unique identifier
of a client session (sometimes called *site ID*, or *process ID*, or *actor ID*).
Session ID is a 53-bit unsigned integer, randomly assigned to user's editing session.
The sequence counter *time* is a monotonically increasing number, which is increased
on each operation, it starts from 0. See [Logical Clock reference][logical-clock].

[logical-clock]: https://streamich.github.io/json-joy/modules/json_crdt_patch_clock.html

The [`Timestamp`](https://streamich.github.io/json-joy/classes/json_crdt_patch_clock.Timestamp.html) class,
the [`ITimestampStruct`](https://streamich.github.io/json-joy/interfaces/json_crdt_patch_clock.ITimestampStruct.html) interface,
and the [`ts`](https://streamich.github.io/json-joy/functions/json_crdt_patch_clock.ts.html) helper method
are used to construct logical timestamps.

```ts
const id = new Timestamp(sessionId, 0);
// or
const id = ts(sessionId, 0);
```

A *timespan* is a 3-tuple which represents an interval of a logical clock timestamps.
The first 2 elements of the 3-tuple are defined exactly as the logical clock timestamp.
The third element is an integer equal or greater than 1, which represents the number of
timestamps in the interval. The [`Timespan`](https://streamich.github.io/json-joy/classes/json_crdt_patch_clock.Timespan.html) class,
the [`ITimespanStruct`](https://streamich.github.io/json-joy/interfaces/json_crdt_patch_clock.ITimespanStruct.html) interface,
and the [`tss`](https://streamich.github.io/json-joy/functions/json_crdt_patch_clock.tss.html) helper method
are used to construct timespans.

```ts
const span = new Timespan(sessionId, 123, 4);
// or
const span = tss(sessionId, 123, 4);
```

See the [Logical Clock reference][logical-clock] for more various helper functions,
which allow to compare and modified timestamps and timespans.

The [`LogicalClock`](https://streamich.github.io/json-joy/classes/json_crdt_patch_clock.LogicalClock.html) class
allows to generate logical timestamps.

```ts
const clock = new LogicalClock(sessionId, 0);
const id1 = clock.tick(1);
const id2 = clock.tick(1);
```

The [`VectorClock`](https://streamich.github.io/json-joy/classes/json_crdt_patch_clock.VectorClock.html) class extends
the `LogicalClock` class, it allows to generate logical timestamps, but it also tracks
the logical clocks of other clients, and advances the *time* of the current clock
to the maximum value of all peers' clocks.

```jj.aside
When using the `ServerVectorClock`, operations are not idempotent, so an extra
care needs to be taken to ensure that operations are not applied more than once.
```

There is also the [`ServerVectorClock`](https://streamich.github.io/json-joy/classes/json_crdt_patch_clock.ServerVectorClock.html), which
is similar to the `VectorClock` but assumes the same session ID of `1` for all clients,
this is useful in a setting, where a central server is responsible for re-broadcasting
operations to all clients. In this setting it is possible to ignore the session ID
when serializing and deserializing timestamps, and only use the *time* value.


## The `Patch` class

The [`Patch` class](https://streamich.github.io/json-joy/classes/json_crdt_patch.Patch.html) is a container of JSON CRDT Patch operations.
The [`.ops`](https://streamich.github.io/json-joy/classes/json_crdt_patch.Patch.html#ops) property is an ordered array which hold the operations.

```ts
const patch = new Patch();

// Create a new "str" RGA-String with ID [123, 0].
patch.ops.push(new NewStrOp(ts(123, 0)));

// Insert "hello" with timespan that starts from [123, 1], into an
// RGA-String with ID [123, 0], at position [123, 0] (the beginning).
patch.ops.push(new InsStrOp(ts(123, 1), ts(123, 0), ts(123, 0), 'hello'));
```

Normally you would not construct a `Patch` manually, but rather use the
`PatchBuilder` class, see below. Useful methods of the `Patch` itself is the
built-in way to serialize and de-serialize the patch to "binary" format.

```ts
const encoded = patch.toBinary();
const decoded = Patch.fromBinary(encoded);
```

Another useful method of the `Patch` class is its `.toString()` method, which
prints a human-readable representation of the patch.

```ts
console.log(patch + '');

// Patch 123.0!6
// ├─ "str" 123.0
// └─ "ins_str" 123.1!5, obj = 123.0 { 123.0 ← "hello" }
```

The above patch span `123.0!6` means that the patch was created at timestamp
`123.0` and it consumes 6 clock ticks --- one for the new "str" RGA-String object,
and one for each of the 5 characters ``js "hello"`` inserted into the string.


## The `PatchBuilder` class

The [`PatchBuilder` class](https://streamich.github.io/json-joy/classes/json_crdt_patch.PatchBuilder.html) is a helper class,
which allows to construct a `Patch` object in a more convenient way. To get started,
create a new instance of the `PatchBuilder` class, by providing a `LogicalClock` instance.

```ts
const clock = new LogicalClock(123, 456);
const builder = new PatchBuilder(clock);
```

The `PatchBuilder` supports all JSON CRDT Patch operations as short-hand methods.

```ts
// Create a "str" RGA-String.
const stringId = builder.str();

// Insert "bar" text into the string at the starting position.
builder.insStr(stringId, stringId, 'bar');

// Create an "obj" LWW-Object.
const objectId = builder.obj();

// Set "foo" property of the object to "bar".
builder.setKeys(objectId, [
  ['foo', stringId],
]);

// Set the document root LWW-Value value to the object.
builder.root(objectId);
```

The `.flush()` method returns the constructed `Patch` object and resets the
builder. You can now print the patch to see what it looks like.

```ts
const patch = builder.flush();
console.log(patch + '');

// Patch 123.456!7
// ├─ "str" 123.456
// ├─ "ins_str" 123.457!3, obj = 123.456 { 123.456 ← "bar" }
// ├─ "obj" 123.460
// ├─ "ins_obj" 123.461!1, obj = 123.460
// │   └─ "foo": 123.456
// └─ "ins_val" 123.462!1, obj = 0.0, val = 123.460
```

The `PatchBuilder` also supports higher-level operations, which result in
multiple operations in the patch. For example, the `.json()` method recursively
walks through a POJO JSON object and creates a JSON CRDT Patch where each node
in the JSON is a separate CRDT object.

For example, lets recursively create a JSON CRDT Patch for the following JSON object
and set it as the document root.

```ts
const json = {
  foo: 'bar',
  baz: 123,
  bools: [true, false],
};

builder.root(
  builder.json(json),
);

const patch = builder.flush();
console.log(patch.toString());

// Patch 123.456!15
// ├─ "obj" 123.456
// ├─ "str" 123.457
// ├─ "ins_str" 123.458!3, obj = 123.457 { 123.457 ← "bar" }
// ├─ "con" 123.461 { 123 }
// ├─ "arr" 123.462
// ├─ "con" 123.463 { true }
// ├─ "val" 123.464 { 123.463 }
// ├─ "con" 123.465 { false }
// ├─ "val" 123.466 { 123.465 }
// ├─ "ins_arr" 123.467!2, obj = 123.462 { 123.462 ← 123.464, 123.466 }
// ├─ "ins_obj" 123.469!1, obj = 123.456
// │   ├─ "foo": 123.457
// │   ├─ "baz": 123.461
// │   └─ "bools": 123.462
// └─ "ins_val" 123.470!1, obj = 0.0, val = 123.456
```

The `konst()` helper method allows one to create a constant value object. A
constant value object is an object which is never modified, its value can be any
JSON value, but it does not accept any operations, hence, to modify it, the parent
object needs to be modified.

```ts
builder.json({
  bools: konst([true, false]),
}),
console.log(builder.flush() + '');

// Patch 123.456!3
// ├─ "obj" 123.456
// ├─ "con" 123.457 { [true,false] }
// └─ "ins_obj" 123.458!1, obj = 123.456
//     └─ "bools": 123.457
```

See the [`PatchBuilder` class reference](https://streamich.github.io/json-joy/classes/json_crdt_patch.PatchBuilder.html) for more details.
