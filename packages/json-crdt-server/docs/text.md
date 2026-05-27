## JSON CRDT server

An HTTP/1.1 and WebSocket server for synchronizing JSON CRDT documents, with
persistent on-disk or in-memory storage. It is the server counterpart to the
local-first [json-crdt-repo](/libs/json-crdt-repo) browser client.


## Run

Start the server without installing:

```
npx json-crdt-server
```

Run in production with on-disk (LevelDB) storage:

```
NODE_ENV=production JSON_CRDT_STORE=level PORT=8080 npx json-crdt-server
```


## Configuration

Environment variables:

- `PORT` — port to listen on (default `9999`).
- `NODE_ENV` — set to `production` in production.
- `JSON_CRDT_STORE` — storage backend; set to `level` for LevelDB.
- `JSON_CRDT_STORE_PATH` — data folder on disk (default `./db`).
