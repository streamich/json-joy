/* tslint:disable no-console */

/**
 * Run this demo with:
 *
 *     npx ts-node src/demo/reactive-rpc/client.ts
 */

import WS from 'isomorphic-ws';
import {RpcClient} from '../../reactive-rpc/common/rpc/RpcClient';
import {Encoder, Decoder} from '../../reactive-rpc/common/codec/binary-msgpack';
import {toUint8Array} from '../../util/toUint8Array';
import {ReactiveRpcResponseMessage} from '../../reactive-rpc/common';

const ws = new WS('ws://localhost:9999/rpc/binary');
const encoder = new Encoder();
const decoder = new Decoder();
const client = new RpcClient({
  send: (messages) => {
    const uint8 = encoder.encode(messages);
    ws.send(uint8);
  },
});

// tslint:disable-next-line no-console
const log = (...args: any[]) => console.log(...args);
// tslint:disable-next-line no-console
const logError = (...args: any[]) => console.error(...args);

ws.onopen = function open() {
  log('connected');

  log('ping', '->', {});
  client.call$('ping', {}).subscribe((res) => {
    log('ping', '<-', res);
  });

  log('auth.users.get', '->', {id: '123'});
  client.call$('auth.users.get', {id: '123'}).subscribe((res) => {
    log('auth.users.get', '<-', res);
  });

  log('UNKNOWN_METHOD', '->', {});
  client.call$('UNKNOWN_METHOD', {id: '123'}).subscribe({
    next: (res) => {
      log('UNKNOWN_METHOD', '<-', res);
    },
    error: (error) => {
      logError('ERROR:', 'UNKNOWN_METHOD', '<-', error);
    },
  });
};

ws.onclose = function close() {
  log('disconnected');
};

ws.onmessage = function incoming(event: any) {
  const uint8 = toUint8Array(event.data);
  const messages = decoder.decode(uint8);
  client.onMessages(messages as ReactiveRpcResponseMessage[]);
};
