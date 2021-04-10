# JSON Rx

Implements server and client classes, `JsonRxServer` and `JsonRxClient`, which
talk [JSON-Rx][json-rx] protocol, which can be used
for RPC and subscription communication over WebSocket.

There is also `JsonRpcRxServer` class which provides as simple RPC implementation
using JSON-Rx protocol. This class can be used for regular HTTP RPC communication.

And, there is also `JsonRpcServer` class, which implements [JSON-RPC][json-rpc]
protocol for HTTP RPC communication.

[json-rx]: https://onp4.com/@vadim/p/gv9z33hjuo
[json-rpc]: https://www.jsonrpc.org/specification


## Examples

```js
import {JsonRxServer, JsonRxClient} from 'json-joy/{lib,es6,esm}/json-rx';

import {from} from 'rxjs';

let client;

const server = new JsonRxServer({
  send: msg => client.onMessage(msg), // On your server, connect to WebSocket.
  call: (method, payload) => {
    if (method === 'count-to-three') return from([1, 2, 3]);
    else if (method === 'echo') return Promise.resolve(payload);
    else throw new Error('unknown method');
  },
  notify: () => {},
});

client = new JsonRxClient({
  // On the browser end, connect JsonRxClient to the WebSocket.
  // send: msg => websocket.send(msg)
  send: msg => setTimeout(() => server.onMessage(msg), 0),
});

// Create a long-lived subscription to your server.
client.call('count-to-three', null).subscribe(console.log)
// 1
// 2
// 3

// Execute request/response.
client.call('echo', 'ahoy').subscribe(console.log);
// ahoy

// Send notification to your server.
client.notify('logout 👋');
```
