/* tslint:disable no-console */

/**
 * Run this demo with:
 * 
 *     npx ts-node demo/json-rx.ts
 */

import {JsonRxServer, JsonRxClient} from '../src/json-rx';
import {from} from 'rxjs';

let client: JsonRxClient;

// On your server, connect JsonRxServer to the WebSocket.
const server = new JsonRxServer({
  send: msg => client.onMessage(msg as any),
  call: (method, payload) => {
    if (method === 'count-to-three') return from([1, 2, 3]);
    else if (method === 'echo') return Promise.resolve(payload);
    else throw new Error('unknown method');
  },
  notify: () => {},
});

// On the browser end, connect JsonRxClient to the WebSocket.
client = new JsonRxClient({
  send: msg => setTimeout(() => server.onMessage(msg), 0),
});

// Create a long-lived subscription to your server.
client.call('count-to-three', {x: 'y'}).subscribe(console.log)
// 1
// 2
// 3

// Execute request/response.
client.call('echo', 'ahoy').subscribe(console.log);
// ahoy
