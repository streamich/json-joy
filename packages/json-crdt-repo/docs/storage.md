## Storage

`LevelLocalRepo` is the local persistence layer. It stores every block as a
collection of LevelDB key/value entries inside one `AbstractLevel`-compatible
KV store. In the browser this is `browser-level` (IndexedDB); for tests and
servers, `memory-level` works too.

You don't usually touch `LevelLocalRepo` directly --- `JsonCrdtRepo`
constructs one for you and `EditSession` reads/writes it through the
`LocalRepo` interface. Use this page when you need to swap the KV backend,
share storage across multiple repos, or talk to local state from a worker.


## Key layout

Per block, keyed by `<collection>/.../<id>`:

| Suffix | Contents |
|---|---|
| `b!.../k!x` | Block metadata (last synced time, last seq, sync state) |
| `b!.../k!m` | The latest server-acknowledged `Model` snapshot |
| `b!.../f!<time>` | Frontier patches not yet pushed to the server |
| `s!b!.../<id>` | "Dirty" marker --- block has unflushed patches |

A worker writing in another tab can therefore find and merge a session by
listening to these keys.


## Constructing one manually

```ts
import {LevelLocalRepo} from '@jsonjoy.com/json-crdt-repo';
import {BrowserLevel} from 'browser-level';
import {Locks} from 'thingies/lib/Locks';
import {BehaviorSubject} from 'rxjs';
import {pubsub} from '@jsonjoy.com/json-crdt-repo';

const kv = new BrowserLevel('my-app', {keyEncoding: 'utf8', valueEncoding: 'view'});

const local = new LevelLocalRepo({
  kv: kv as any,
  locks: new Locks(),
  sid: 12345,                    // Site ID for the JSON CRDT clock
  rpc: myRemoteHistory,          // see /libs/json-crdt-repo/remote
  pubsub: pubsub('my-app'),      // cross-tab broadcast
  connected$: new BehaviorSubject(true),
});
```

| Option | Description |
|---|---|
| `kv` | Any `AbstractLevel<any, string, Uint8Array>` |
| `locks` | `thingies` `Locks` instance --- coordinates concurrent operations |
| `sid` | This client's CRDT Site ID; must be stable across sessions |
| `rpc` | A `ServerHistory` implementation (see [Remote](/libs/json-crdt-repo/remote)) |
| `pubsub` | A `PubSub` instance --- `pubsub(name)` returns `BroadcastChannel` or memory |
| `connected$` | RxJS `Observable<boolean>` of online state; gates remote sync |
| `onSyncError` | Optional handler for sync failures |


## Cross-tab sync

The pubsub argument is the broadcast bus between tabs of the same origin.
After a tab writes patches it publishes one of these messages:

| Type | Meaning |
|---|---|
| `reset` | Replace the local model with the broadcast snapshot |
| `merge` | Apply broadcast patches on top of the current state |
| `rebase` | Re-time in-progress edits over remote patches |
| `del` | The block was deleted in another tab |

Receivers translate these into `LocalRepoEvent`s on `repo.change$(id)`,
which the `EditSession` consumes automatically.

For non-browser environments (tests, Node), use the in-memory `pubsub(name)`
which the package exports --- it caches by name so multiple repos in the
same process share a bus.


## Reading without a session

```ts
const {model, cursor} = await repo.get({id: ['notes', 'note-42']});
```

Returns the cached snapshot plus all frontier patches applied. Useful for
read-only views, exports, or service workers.

The lower-level `repo.get0(id)` (if implemented) returns the raw snapshot,
unmerged frontier, and metadata separately --- for debugging.
