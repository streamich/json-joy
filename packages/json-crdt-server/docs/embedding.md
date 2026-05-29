## Embedding the server

The `json-crdt-server` CLI is a thin wrapper around two factories:

- `createServices()` --- builds the in-memory or LevelDB-backed
  `Services` (blocks, presence, pub/sub).
- `createCaller(services)` --- builds a typed RPC callee around those
  services.

Combine them with [`RpcServer`](/libs/rpc-server/http1-server) to host the
API yourself, in your own process, alongside your own routes.


## Minimal embed

```ts
import {createCaller, createServices} from '@jsonjoy.com/json-crdt-server';
import {RpcServer} from '@jsonjoy.com/rpc-server/lib/http1/RpcServer';

const services = await createServices();
const {caller} = createCaller(services);

const server = await RpcServer.startWithDefaults({
  port: 8080,
  callee: caller,
});
```

`createServices()` reads `JSON_CRDT_STORE` and `JSON_CRDT_STORE_PATH` from
the environment to decide between in-memory and LevelDB. Pass your own
`Services` instance if you want full control over storage:

```ts
import {Services} from '@jsonjoy.com/json-crdt-server/lib/services/Services';
import {MemoryStore} from '@jsonjoy.com/json-crdt-server/lib/services/blocks/store/MemoryStore';

const services = new Services({store: new MemoryStore()});
const {caller} = createCaller(services);
```


## Adding custom routes

`createCaller` returns the `router` it built --- you can add more methods to
it before passing the caller to the server. Methods are defined with
[`@jsonjoy.com/json-type`](https://github.com/streamich/json-joy/tree/master/packages/json-type)
schemas, the same way as the built-in ones.

For non-RPC HTTP routes (health, webhook receivers), drop down to
[`Http1Server`](/libs/rpc-server/http1-server) directly and call `route(...)`
on it before starting.


## TLS

The bundled `main.ts` recognizes `SSL_KEY` and `SSL_CRT` env vars and, if
present, switches to HTTPS on port 8443 by default with daily certificate
refresh. To enable TLS programmatically, pass `create.tls = true` to
`RpcServer.startWithDefaults` --- see
[HTTP/1.1 server](/libs/rpc-server/http1-server).


## Tying into a local-first client

The browser-side counterpart is [`@jsonjoy.com/json-crdt-repo`](/libs/json-crdt-repo).
It talks to this server over WebSocket using the `block.*` API, so you don't
have to call those methods by hand.
