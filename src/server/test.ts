// Run: npx ts-node src/server/test.ts

import WebSocket from 'ws';
import {CborJsonValueCodec} from '../json-pack/codecs/cbor';
import {RpcPersistentClient, WebSocketChannel} from '../reactive-rpc/common';
import {RpcCodec} from '../reactive-rpc/common/codec/RpcCodec';
import {BinaryRpcMessageCodec} from '../reactive-rpc/common/codec/binary';
import {Writer} from '../util/buffers/Writer';
import {JsonJsonValueCodec} from '../json-pack/codecs/json';
import {CompactRpcMessageCodec} from '../reactive-rpc/common/codec/compact';

const writer = new Writer();
const codec = new RpcCodec(new CborJsonValueCodec(writer), new BinaryRpcMessageCodec());
// const codec = new RpcCodec(new JsonJsonValueCodec(writer), new CompactRpcMessageCodec());
const client = new RpcPersistentClient({
  codec,
  channel: {
    newChannel: () =>
      new WebSocketChannel({
        newSocket: () =>
          new WebSocket('ws://127.0.0.1:9999/rpc', {
            // protocol: 'rpc.rx.compact.json',
            protocol: 'rpc.rx.binary.cbor',
            perMessageDeflate: false,
          }) as any,
        // newSocket: () => new WebSocket(this.wsHost, 'rpc.rx.compact.json'),
      }),
  },
});

client.start();

console.log('call');
client.notify('.ping', {});
client
  .call('util.ping', {})
  .then((value) => {
    console.log('then', value);
  })
  .catch((error) => {
    console.log('catch', error);
  });

// const ws = new WebSocket('ws://127.0.0.1:9999/rpc', {
//   protocol: 'rpc.rx.compact.json',
// });

// ws.onmessage = (msg) => console.log('msg', msg.data);

// ws.onopen = () => {
//   console.log('open');
//   ws.send(JSON.stringify([1,1,'util.ping',{}]));
// };
