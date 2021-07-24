import WS from 'isomorphic-ws';
import {RpcClient} from '../../reactive-rpc/common/rpc/RpcClient';
import {Encoder, Decoder} from '../../reactive-rpc/common/codec/binary-msgpack';
import {toUint8Array} from '../../util/toUint8Array';
import {ReactiveRpcResponseMessage} from '../../reactive-rpc/common';

const ws: WebSocket = new WS('ws://localhost:9999/rpc/binary');
const encoder = new Encoder();
const decoder = new Decoder();
const client = new RpcClient({
  send: (messages) => {
    const uint8 = encoder.encode(messages);
    ws.send(uint8);
  },
});

ws.onopen = function open() {
  console.log('connected');

  console.log('ping', '->', {});
  client.call$('ping', {})
    .subscribe(res => {
      console.log('ping', '<-', res);
    });

  console.log('auth.users.get', '->', {id: '123'});
  client.call$('auth.users.get', {id: '123'})
    .subscribe(res => {
      console.log('auth.users.get', '<-', res);
    });

  console.log('UNKNOWN_METHOD', '->', {});
  client.call$('UNKNOWN_METHOD', {id: '123'})
    .subscribe({
      next: res => {
        console.log('UNKNOWN_METHOD', '<-', res);
      },
      error: error => {
        console.error('ERROR:', 'UNKNOWN_METHOD', '<-', error);
      },
    });
};

ws.onclose = function close() {
  console.log('disconnected');
};

ws.onmessage = function incoming(event: any) {
  let uint8 = toUint8Array(event.data);
  const messages = decoder.decode(uint8);
  client.onMessages(messages as ReactiveRpcResponseMessage[]);
};
