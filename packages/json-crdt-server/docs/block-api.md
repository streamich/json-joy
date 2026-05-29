## Block API

A *block* is a collaboratively edited JSON CRDT document with a globally
unique ID. The server stores a snapshot (the latest known model) plus a list
of recent batches of patches that have been applied since the snapshot was
taken. The history can be replayed against the snapshot to reach any past
state.

Patches and snapshots are sent as opaque binary blobs (`Uint8Array`). They
are produced and consumed by the [json-joy JSON CRDT](/libs/json-joy-js/json-crdt)
runtime --- use `Patch.toBinary()` / `Model.toBinary()` to encode and
`Patch.fromBinary()` / `Model.fromBinary()` to decode.


## Methods

| Method | Streaming | Purpose |
|---|---|---|
| `block.new` | --- | Create a new block (errors if it already exists) |
| `block.get` | --- | Read snapshot + tip batches |
| `block.view` | --- | Read the materialized JSON value |
| `block.upd` | --- | Append patches; optionally pull missed batches |
| `block.del` | --- | Delete the block |
| `block.listen` | yes | Subscribe to live update events |
| `block.scan` | --- | Fetch a range of historic batches |
| `block.pull` | --- | Catch up from a known cursor |


## `block.new`

Create a new block with an optional initial batch of patches.

```
Request:  {id, batch?: {patches: [{blob}], cts?}}
Response: {snapshot: {id, seq, ts}}
```

Errors if a block with the same ID already exists.


## `block.get`

Read the latest snapshot plus any tip batches.

```
Request:  {id}
Response: {block: {id, ts, uts, snapshot: {seq, ts, blob}, tip: [batch...]}}
```

To compute the latest view: decode `snapshot.blob` into a `Model`, then apply
every `patch.blob` from every batch in `tip`.


## `block.view`

Materialized JSON shortcut. The server reconstructs and serializes the
current view.

```
Request:  {id}
Response: {view: any}
```

Cheaper for clients that only need the value, not the CRDT.


## `block.upd`

Apply a batch of patches to an existing block. Pass `create: true` to also
upsert when the block is missing.

```
Request:  {id, batch: {patches: [{blob}], cts?}, create?, seq?, clientId?}
Response: {batch: {seq, ts}, pull?: {batches, snapshot?}}
```

When the client provides its current `seq`, the server returns any batches it
missed in `pull`. If the gap is wider than ~100 batches, the server includes
a fresh `pull.snapshot` instead. `clientId` lets the server filter the update
out of that client's own `block.listen` stream.


## `block.del`

Idempotent deletion. Returns `{success: false}` if the block did not exist.

```
Request:  {id}
Response: {success: boolean}
```


## `block.listen`

Streaming subscription to updates for a block. Emits an event each time the
block is created, updated, or deleted.

```
Request:  {id, clientId?}
Stream:   {event: ['new'] | ['del'] | ['upd', {batch}, clientId]}
```

If `clientId` is set, updates originated by that client are filtered out ---
useful to avoid echoing the user's own edits back to themselves.


## `block.scan`

Fetch a slice of historic batches.

```
Request:  {id, seq?, limit?: 1..1000, snapshot?: bool}
Response: {batches: [batch...], snapshot?}
```

If `snapshot` is `true`, the server includes the snapshot of state right
before the first returned batch, so the client can replay forward.


## `block.pull`

Higher-level "catch up" call --- use this instead of `block.scan` when you
hold a cursor and want to advance to the latest state.

```
Request:  {id, seq, create?}
Response: {batches: [batch...], snapshot?}
```

- If the client is close to the head, the response is just the missing
  batches.
- If the client is far behind, the response includes a fresh `snapshot` plus
  any subsequent batches.
- If the client's `seq` is ahead of the server, the block was deleted and
  recreated --- the client should reset and apply the returned snapshot.

Pass `seq: -1` on first sync.
