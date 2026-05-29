## JsonCrdtRepo

`JsonCrdtRepo` is the top-level wiring. One `new JsonCrdtRepo(...)` call
constructs the storage layer, the remote client, the cross-tab pub/sub, and
the session factory.

```ts
import {JsonCrdtRepo} from '@jsonjoy.com/json-crdt-repo';

const repo = new JsonCrdtRepo({
  name: 'my-app',
  wsUrl: 'wss://my-server.example.com/rx',
});
```


## Options

| Option | Default | Description |
|---|---|---|
| `name` | `'json-crdt-repo'` | IndexedDB database name; also used as the BroadcastChannel name for cross-tab sync |
| `wsUrl` | public demo server | WebSocket URL of the `json-crdt-server` to talk to |

The constructor also reads (and writes) `localStorage[<name>-sid]` to assign
the browser a stable Site ID for the JSON CRDT logical clock. Falls back to
an in-memory ID if `localStorage` is unavailable.


## What it exposes

```ts
class JsonCrdtRepo {
  readonly repo:     LevelLocalRepo;
  readonly sessions: EditSessionFactory;
  readonly remote:   DemoServerRemoteHistory;
  readonly client:   DemoServerClient;
  readonly opts:     JsonCrdtRepoOpts;

  make(id?: string | string[]): EditSession;
}
```

| Member | Use it for |
|---|---|
| `sessions` | Create or load [editing sessions](/libs/json-crdt-repo/sessions) |
| `repo` | Low-level [storage operations](/libs/json-crdt-repo/storage) (rarely needed) |
| `remote` | Raw [server calls](/libs/json-crdt-repo/remote): read snapshots, scan history |
| `client` | The underlying Reactive RPC client; use to call non-block server methods |


## `repo.make(id?)`

Convenience shortcut for the most common operation: synchronously create an
in-memory session, and asynchronously persist + pull it.

```ts
const session = repo.make(['notes', 'note-42']);
session.model.api.obj([]).set({title: 'Hello'});
```

The ID can be a single string or an array of path segments. With no argument,
the repo generates one and places it under the `default` collection.

For more control (load-or-create, timeouts, schema), use
`repo.sessions.load(...)` directly --- see [Sessions](/libs/json-crdt-repo/sessions).


## Replacing the default server

The constructor builds a `DemoServerRemoteHistory` and `LevelLocalRepo`
internally with sensible defaults. If you need a custom remote (a different
protocol, a P2P peer, an offline-only deployment) or a non-browser storage
layer, construct `LevelLocalRepo` and `EditSessionFactory` yourself --- see
their respective pages for the underlying interfaces.
