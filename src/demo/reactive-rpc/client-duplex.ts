import WS from 'isomorphic-ws';
import {RpcDuplex} from '../../reactive-rpc/common/rpc/RpcDuplex';
import {RpcClient} from '../../reactive-rpc/common/rpc/RpcClient';
import {RpcServer} from '../../reactive-rpc/common/rpc/RpcServer';
import {formatError} from '../../reactive-rpc/common/rpc/error';
import {Encoder, Decoder} from '../../reactive-rpc/common/codec/binary-msgpack';
import {toUint8Array} from '../../util/toUint8Array';
import {ReactiveRpcResponseMessage} from '../../reactive-rpc/common';

const ws: WebSocket = new WS('ws://localhost:9999/rpc/binary');
const encoder = new Encoder();
const decoder = new Decoder();
const duplex = new RpcDuplex({
  client: new RpcClient({
    send: (messages) => {
      const uint8 = encoder.encode(messages);
      ws.send(uint8);
    },
  }),
  server: new RpcServer({
    formatError,
    onCall: () => ({
      isStreaming: false,
      call: async () => null,
    }),
    onNotification: () => {},
    send: (messages) => {
      const uint8 = encoder.encode(messages);
      ws.send(uint8);
    },
  }),
});

ws.onopen = function open() {
  console.log('connected');

  console.log('ping', '->', {});
  duplex.call$('ping', {})
    .subscribe(res => {
      console.log('ping', '<-', res);
    });

  console.log('auth.users.get', '->', {id: '123'});
  duplex.call$('auth.users.get', {id: '123'})
    .subscribe(res => {
      console.log('auth.users.get', '<-', res);
    });

  console.log('UNKNOWN_METHOD', '->', {});
  duplex.call$('UNKNOWN_METHOD', {id: '123'})
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
  const uint8 = toUint8Array(event.data);
  const messages = decoder.decode(uint8, 0, uint8.byteLength);
  duplex.onMessages(messages as ReactiveRpcResponseMessage[], {});
};
