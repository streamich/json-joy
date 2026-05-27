# `@jsonjoy.com/json-crdt-server`

A real-time collaborative editing server for [JSON CRDT](https://jsonjoy.com)
documents. Stores documents persistently on disk (LevelDB) or in memory, and
exposes a full API over HTTP/1.1 and WebSocket using the
[JSON-RPC 2.0](https://www.jsonrpc.org/specification) and
[JSON Reactive RPC (JSON Rx)](https://jsonjoy.com/specs/json-rx) protocols.


## Features

- **Persistent storage** — LevelDB on disk, or in-memory for development.
- **Two RPC protocols** — JSON-RPC 2.0 (request/response) and JSON Rx
  (bidirectional streaming over WebSocket).
- **Block management** — create, read, update, delete, and subscribe to
  real-time changes on JSON CRDT documents ("blocks").
- **Presence** — per-room user presence with TTL-based expiration.
- **Pub/Sub** — lightweight publish/subscribe messaging channels.
- **History** — configurable patch history per document with compaction.

## Getting Started

### Quick Start

Run the server without installation:

```bash
npx json-crdt-server
```

Test that it's running:

```bash
curl localhost:9999/rpc -d '[1,1,"util.ping"]'
```

### Configuration

Environment variables:

| Variable | Default | Description |
|---|---|---|
| `PORT` | `9999` | Port number to listen on |
| `NODE_ENV` | — | Set to `"production"` in production |
| `JSON_CRDT_STORE` | `"memory"` | Storage backend; set to `"level"` for LevelDB |
| `JSON_CRDT_STORE_PATH` | `"./db"` | Folder to store data on disk |

### Production Deployment

```bash
NODE_ENV=production \
JSON_CRDT_STORE=level \
PORT=8080 \
  npx json-crdt-server
```

Or, with PM2 for process management:

```bash
yarn build

NODE_ENV=production \
PORT=8080 \
JSON_CRDT_STORE=level \
  npx pm2 start lib/main.js \
    --exp-backoff-restart-delay=100
```

## API

### Block Operations

| Method | Description |
|---|---|
| `block.new` | Create a new JSON CRDT document |
| `block.get` | Retrieve a document by ID |
| `block.view` | Get the current document state as plain JSON |
| `block.upd` | Push patches to update a document |
| `block.del` | Delete a document |
| `block.listen` | Subscribe to real-time document changes (streaming) |
| `block.scan` | Scan document patch history |
| `block.pull` | Pull batches from a given sequence point |

### Presence Operations

| Method | Description |
|---|---|
| `presence.update` | Update user presence in a room (with TTL) |
| `presence.remove` | Remove a user from a room |
| `presence.listen` | Subscribe to presence changes (streaming) |

### Pub/Sub Operations

| Method | Description |
|---|---|
| `pubsub.publish` | Publish a message to a channel |
| `pubsub.listen` | Subscribe to a channel (streaming) |

### Utility Operations

| Method | Description |
|---|---|
| `util.ping` | Health check (returns `"pong"`) |
| `util.echo` | Echo back a request |
| `util.info` | Server statistics |
| `util.schema` | TypeScript schema of all RPC methods |

### Example Requests

JSON-RPC 2.0:

```bash
curl localhost:8080/rpc \
  -H 'Content-Type: rpc.json2.verbose.json' \
  -d '{"method": "util.ping", "id": 1}'
```

JSON Reactive RPC (compact encoding):

```bash
curl localhost:8080/rpc -d '[1,1,"util.ping"]'
```
