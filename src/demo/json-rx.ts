/* tslint:disable no-console */

/**
 * Run this demo with:
 *
 *     npx ts-node demo/json-rx.ts
 */

import {JsonRxServer, JsonRxClient} from '../json-rx';
import {from} from 'rxjs';

let client: JsonRxClient;

const server = new JsonRxServer({
  send: (msg) => client.onMessage(msg as any), // On your server, connect to WebSocket.
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
  send: (msg) => setTimeout(() => server.onMessage(msg, {}), 0),
});

// Create a long-lived subscription to your server.
client.call('count-to-three', {x: 'y'}).subscribe(console.log);
// 1
// 2
// 3

// Execute request/response.
client.call('echo', 'ahoy').subscribe(console.log);
// ahoy
