## JSON CRDT repo

`@jsonjoy.com/json-crdt-repo` is a local-first browser client for
[JSON CRDT](/libs/json-joy-js/json-crdt) documents. It persists documents in
IndexedDB, lets the user keep editing while offline, and synchronizes with a
[`@jsonjoy.com/json-crdt-server`](/libs/json-crdt-server) instance when the
network is available.

Cross-tab edits are broadcast over `BroadcastChannel`, so the same browser
windowing into the same document stays consistent without a server round-trip.


## Installation

```
npm install @jsonjoy.com/json-crdt-repo json-joy
```

`json-joy` supplies the underlying `Model`, `Patch`, and `s` schema builders.


## Quick start

```ts
import {JsonCrdtRepo} from '@jsonjoy.com/json-crdt-repo';
import {s} from 'json-joy/lib/json-crdt';

const repo = new JsonCrdtRepo({
  wsUrl: 'wss://my-server.example.com/rx',
});

const session = await repo.sessions.load({
  id: ['notes', 'note-42'],
  make: {schema: s.obj({title: s.str(''), body: s.str('')})},
  remote: {timeout: 1000},
});

session.model.api.obj([]).set({title: 'Hello'});
console.log(session.model.view());
```

`sessions.load(...)` returns an [`EditSession`](/libs/json-crdt-repo/sessions).
Edits made via `session.model.api.*` are persisted locally and synchronized
with the server in the background.


## Surface

| Area | Surface |
|---|---|
| Top-level | [`JsonCrdtRepo`](/libs/json-crdt-repo/repo) --- one-call setup |
| Sessions | [`EditSession`, `EditSessionFactory`](/libs/json-crdt-repo/sessions) --- per-document editor handles |
| Storage | [`LevelLocalRepo`](/libs/json-crdt-repo/storage) --- persistence + cross-tab sync |
| Remote | [`DemoServerRemoteHistory`](/libs/json-crdt-repo/remote) --- talks to `json-crdt-server` |


## What "local-first" means here

- Edits apply immediately to the in-memory model and persist to IndexedDB
  before any network call.
- If the server is unreachable, edits accumulate in a local "frontier" and
  flush automatically when the connection comes back.
- Other tabs in the same browser receive merges via `BroadcastChannel`
  without going through the server.
- When the server returns concurrent edits, they are merged into the local
  session using CRDT rules --- no conflict prompts.

See [`json-crdt-server`](/libs/json-crdt-server) for the server side of this
protocol, or roll your own by implementing the `RemoteHistory` interface and
passing it in (see [Remote](/libs/json-crdt-repo/remote)).
