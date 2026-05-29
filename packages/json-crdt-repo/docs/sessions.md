## Sessions

An `EditSession` is the editor handle for a single document. It wraps a
JSON CRDT `Log` (the model plus the in-progress patch list) and ties it to
the local storage and remote sync layers.

`EditSessionFactory` (exposed as `repo.sessions`) creates them in two ways:

| Method | Returns | Use when |
|---|---|---|
| `factory.make(opts)` | `{session, sync?}` synchronously | You want a session immediately, possibly before sync completes |
| `factory.load(opts)` | `Promise<EditSession>` | You want to read existing state before showing UI |


## `factory.make(opts)`

Returns immediately with a session that has an empty model. Local persistence
and remote pull happen in the background.

```ts
const {session, sync} = repo.sessions.make({
  id: ['notes', 'note-42'],
  schema: s.obj({title: s.str(''), body: s.str('')}),
  pull: true,
});

// Optional: wait for the first sync round-trip.
await sync;
```

| Option | Description |
|---|---|
| `id` | `BlockId` --- one or more path segments, last one is the document ID |
| `schema` | Optional `NodeBuilder` initial schema (json-joy `s.*` builder) |
| `pull` | Default `true`. If the block already exists, pull its state into the session |


## `factory.load(opts)`

Async load. Throws if the block does not exist (locally and remotely). Use
`make` to also create-if-missing.

```ts
const session = await repo.sessions.load({
  id: ['notes', 'note-42'],
  make: {schema: s.obj({title: s.str('')})},
  remote: {timeout: 1000},
});
```

| Option | Description |
|---|---|
| `id` | `BlockId` |
| `make` | If the block does not exist anywhere, create it with these options |
| `pull` | Refresh remote state in the background after local load |
| `remote.timeout` | Wait at most N ms for the remote when the block is missing locally |
| `remote.throwIf` | `'missing'` or `'exists'` to assert remote state |

Errors thrown via `error.code`:

| Code | When |
|---|---|
| `NOT_FOUND` | Block missing locally and no `make` / no remote hit |
| `TIMEOUT` | Remote took longer than `remote.timeout` and no `make` fallback |
| `EXISTS` | `remote.throwIf: 'exists'` and the block does exist remotely |


## The `EditSession` object

```ts
class EditSession {
  readonly id:    BlockId;
  readonly model: Model;          // current materialised model
  readonly log:   Log;            // model + frontier patches
  cursor:         unknown;        // last seen remote cursor
  onsyncerror?:   (e: unknown) => void;

  sync():    Promise<{remote?: Promise<void>} | null>;
  load():    Promise<void>;       // re-read from local storage
  del():     Promise<void>;       // delete locally and remotely
  dispose(): void;                // stop subscriptions
}
```

Edits go through `session.model.api.*`. The session subscribes to the
model's `onFlush` and `onPatch` events --- once a patch is committed, the
session schedules a `sync()` and the change is persisted on the next tick.

```ts
session.model.api.str(['title']).ins(0, 'Hello');
// Persisted to IndexedDB and queued for the server automatically.
```


## What `sync()` does

A single `sync()` call collapses three operations:

1. **Flush** any pending API mutations into patches.
2. **Push** new patches to the local repo, which marks them as dirty and
   later sends them to the remote.
3. **Pull** the latest concurrent state and merge it into the session.

The returned promise resolves when the local round-trip is done. The
optional `remote` promise on the result resolves once the patches have made
it to the server.

```ts
const res = await session.sync();
await res?.remote;  // wait for server ack
```

You usually don't have to call `sync()` --- the session auto-syncs on flush.
Call it explicitly when you need to await server delivery (e.g. before
closing the tab or showing a "saved" indicator).


## Lifecycle

`session.dispose()` unsubscribes the session from local repo events. The
session is no longer reactive after disposal but the underlying model object
is still usable. Call it when the editor unmounts.

`session.del()` deletes the block locally and remotely, then disposes the
session.
