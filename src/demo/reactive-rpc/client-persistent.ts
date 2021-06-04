import WS from 'isomorphic-ws';
import {formatError} from '../../reactive-rpc/common/rpc';
import {RxPersistentClient} from '../../reactive-rpc/common/websocket';
import {Encoder, Decoder} from '../../reactive-rpc/common/codec/binary-msgpack';

const client = new RxPersistentClient({
  ws: {
    newSocket: () => {
      const ws: WebSocket = new WS('ws://localhost:9999/rpc/binary');
      ws.binaryType = 'arraybuffer';
      return ws;
    },
  },
  client: {},
  server: {
    formatError,
    onCall: () => ({
      isStreaming: false,
      call: async () => null,
    }),
    onNotification: () => {},
  },
  codec: {
    encoder: new Encoder(),
    decoder: new Decoder(),
  },
});

client.rpc$.subscribe(rpc => {
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
});
