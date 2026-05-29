# `@jsonjoy.com/json-crdt-repo`

A local-first browser client for [JSON CRDT](https://jsonjoy.com) documents.
Persists documents in the browser (IndexedDB via LevelDB) and synchronizes
with a [`@jsonjoy.com/json-crdt-server`](../json-crdt-server) instance when
online. Supports full offline editing — changes are queued locally and synced
automatically when connectivity is restored.

## Features

- **Offline-first** — create and edit documents without a server; changes sync
  when back online.
- **Browser persistence** — documents are stored in IndexedDB using
  [`browser-level`](https://github.com/Level/browser-level).
- **Cross-tab sync** — edits in one tab are broadcast to other tabs via
  `BroadcastChannel`.
- **Pluggable remote** — connects to any server implementing the JSON CRDT
  block protocol (default: the public demo server).
- **Undo/Redo** — built-in undo/redo stack for editing sessions.
- **Session management** — `EditSession` wraps a JSON CRDT `Log` with
  automatic flush, sync, and patch tracking.

## Getting Started

### Installation

```bash
npm install @jsonjoy.com/json-crdt-repo
```

### Quick Start

```typescript
import {JsonCrdtRepo} from '@jsonjoy.com/json-crdt-repo';

// Create a repo that connects to your server
const repo = new JsonCrdtRepo({
  wsUrl: 'wss://my-server.example.com/rx',
});

// Create a new document
const session = repo.make('my-document');

// The session exposes a JSON CRDT model you can edit
console.log(session.model.view());

// Edit the document
session.model.api.obj([]).set({hello: 'world'});

// Changes are automatically persisted locally and synced to the server
```

### Key Classes

| Class | Description |
|---|---|
| `JsonCrdtRepo` | Top-level entry point; wires together local storage, remote sync, and session factory |
| `EditSession` | In-memory editing session for a single document; wraps a JSON CRDT `Log` |
| `EditSessionFactory` | Creates and loads `EditSession` instances |
| `LevelLocalRepo` | Local persistence layer using LevelDB (IndexedDB in browser) |
| `DemoServerRemoteHistory` | Remote sync implementation using JSON Rx RPC over WebSocket |
| `PubSubBC` | Cross-tab notification via `BroadcastChannel` |
