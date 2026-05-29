## JSON CRDT server

`@jsonjoy.com/json-crdt-server` is a real-time collaboration server for
[JSON CRDT](/libs/json-joy-js/json-crdt) documents. It stores documents
persistently on disk (LevelDB) or in memory and exposes a full API over
HTTP/1.1 and WebSocket using [Reactive JSON-RPC](/specs/json-rx) and JSON-RPC 2.0.

It is the server counterpart to the local-first
[`@jsonjoy.com/json-crdt-repo`](/libs/json-crdt-repo) browser client.


## Run

Start without installing:

```
npx json-crdt-server
```

Sanity check:

```
curl localhost:9999/rpc -d '[1,1,"util.ping"]'
```

Run with persistent on-disk LevelDB storage:

```
NODE_ENV=production JSON_CRDT_STORE=level PORT=8080 npx json-crdt-server
```


## Configuration

| Variable | Default | Description |
|---|---|---|
| `PORT` | `9999` | Port to listen on |
| `NODE_ENV` | --- | Set to `production` in production |
| `JSON_CRDT_STORE` | in-memory | Set to `level` for persistent LevelDB storage |
| `JSON_CRDT_STORE_PATH` | `./db` | Folder for the LevelDB database |
| `SSL_KEY`, `SSL_CRT` | --- | Paths to TLS key/cert; presence enables HTTPS on `:8443` |


## API surface

The server exposes four method groups. Click through for full request/response
schemas and examples.

| Group | Methods |
|---|---|
| [Blocks](/libs/json-crdt-server/block-api) | `block.new`, `block.get`, `block.view`, `block.upd`, `block.del`, `block.listen`, `block.scan`, `block.pull` |
| [Presence](/libs/json-crdt-server/presence) | `presence.update`, `presence.listen`, `presence.remove` |
| [Pub/Sub](/libs/json-crdt-server/pubsub) | `pubsub.publish`, `pubsub.listen` |
| [Embedding](/libs/json-crdt-server/embedding) | `createCaller`, `createServices`, custom routes |


## Calling the API

The server speaks two RPC protocols on the same HTTP server, selected by the
URL path:

```
# Reactive JSON-RPC, Compact message format, JSON values
curl localhost:9999/rpc -d '[1,1,"util.ping"]'

# JSON-RPC 2.0
curl localhost:9999/rpc \
  -H 'Content-Type: rpc.json2.verbose.json' \
  -d '{"method": "util.ping", "id": 1}'

# WebSocket (bidirectional, streaming subscriptions)
websocat ws://localhost:9999/rx
[1,1,"util.info"]
```

The transport layer comes from [`@jsonjoy.com/rpc-server`](/libs/rpc-server),
codec negotiation rules live there.
