## Remote

The remote layer is what `LevelLocalRepo` calls when it needs to talk to a
server: push new patches, pull missed batches, subscribe to live updates.

It is fronted by the abstract `RemoteHistory<Cursor>` interface, and the
package ships one concrete implementation, `DemoServerRemoteHistory`, that
talks to [`@jsonjoy.com/json-crdt-server`](/libs/json-crdt-server) over
Reactive JSON-RPC.


## `DemoServerRemoteHistory`

Built by `JsonCrdtRepo` from the `wsUrl` option:

```ts
import {createBinaryClient} from '@jsonjoy.com/rpc-client';
import {DemoServerRemoteHistory} from '@jsonjoy.com/json-crdt-repo';

const client = createBinaryClient('wss://example.com/rx');
const remote = new DemoServerRemoteHistory(client, /* clientId */ 42);
```

The `clientId` is forwarded with every update so that the server's
`block.listen` stream can filter the client's own edits back out.

Methods (all forward directly to the matching `block.*` RPC on the server):

| Method | Server call |
|---|---|
| `read(id)` | `block.get` |
| `pull(id, seq, create?)` | `block.pull` |
| `scanFwd(id, seq)` / `scanBwd(...)` | `block.scan` |
| `create(id, batch?)` | `block.new` |
| `update(id, batch, seq?)` | `block.upd` |
| `delete(id)` | `block.del` |
| `listen(id)` | `block.listen` |

You can call these directly when you need raw server data --- e.g. to render
a remote-only preview without involving the local repo:

```ts
const {block} = await repo.remote.read('notes/note-42');
const model = Model.fromBinary(block.snapshot.blob);
for (const batch of block.tip)
  for (const patch of batch.patches)
    model.applyPatch(Patch.fromBinary(patch.blob));

console.log(model.view());
```


## The `RemoteHistory` interface

```ts
interface RemoteHistory<Cursor = unknown, Block, Snapshot, Batch> {
  read(id):                              Promise<{block: Block}>;
  pull(id, seq, create?):                Promise<{batches: Batch[]; snapshot?: Snapshot}>;
  scanFwd(id, seq):                      Promise<{batches: Batch[]}>;
  scanBwd(id, seq):                      Promise<{batches: Batch[]; snapshot?: Snapshot}>;
  create(id, batch?):                    Promise<{snapshot, batch}>;
  update(id, batch, seq):                Promise<{batch, pull?: {batches, snapshot?}}>;
  delete?(id):                           Promise<void>;
  listen(id):                            Observable<{event: RemoteEvent<Cursor>}>;
}
```

`Cursor` is the opaque position-in-history type. For a central server it is
typically a number (the batch sequence). For peer-to-peer setups it could
be a vector clock. Code above the `RemoteHistory` abstraction treats it as
`unknown` and never inspects it.

Implement this interface to plug in a different transport (e.g. HTTP polling
instead of WebSocket), a P2P backend, or a content-addressed log. Then pass
your implementation as `rpc` to `LevelLocalRepo` --- see
[Storage](/libs/json-crdt-repo/storage).


## Connectivity state

`LevelLocalRepo` is constructed with a `connected$: Observable<boolean>`
that gates remote calls. In a browser, `JsonCrdtRepo` uses `onLine$` from
`rx-use`, which mirrors `navigator.onLine` plus the `online`/`offline`
events.

When `connected$` emits `false`, sync attempts are skipped (frontier patches
stay queued). When it flips back to `true`, the dirty queue is drained.
