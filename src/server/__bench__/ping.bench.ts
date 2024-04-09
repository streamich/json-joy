// npx ts-node src/server/__bench__/ping.bench.ts

/* tslint:disable no-console */

import {Suite} from 'benchmark';
import {RpcPersistentClient, WebSocketChannel} from '../../reactive-rpc/common';
import {Writer} from '@jsonjoy.com/json-pack/lib/util/buffers/Writer';
import {BinaryRpcMessageCodec} from '../../reactive-rpc/common/codec/binary';
import {CompactRpcMessageCodec} from '../../reactive-rpc/common/codec/compact';
import {CborJsonValueCodec} from '@jsonjoy.com/json-pack/lib/codecs/cbor';
import {JsonJsonValueCodec} from '@jsonjoy.com/json-pack/lib/codecs/json';
import {RpcCodec} from '../../reactive-rpc/common/codec/RpcCodec';
import {WebSocket} from 'ws';

const main = async () => {
  const writer = new Writer(1024 * 4);
  // const msg = new BinaryRpcMessageCodec();
  // const req = new CborJsonValueCodec(writer);
  const msg = new CompactRpcMessageCodec();
  const req = new JsonJsonValueCodec(writer);
  const codec = new RpcCodec(msg, req, req);
  const client = new RpcPersistentClient({
    codec,
    channel: {
      newChannel: () =>
        new WebSocketChannel({
          newSocket: () =>
            new WebSocket('ws://localhost:9999/rpc', [codec.specifier()], {perMessageDeflate: false}) as any,
        }),
    },
  });
  client.start();

  await client.call('util.ping', {}); // Warmup

  const suite = new Suite();
  suite
    .add('fetch', async () => {
      const res = await fetch('http://localhost:9999/ping', {keepalive: true});
      const pong = await res.text();
      if (pong !== '"pong"') throw new Error('Unexpected response');
    })
    .add('RpcPersistentClient', async () => {
      const res = await client.call('util.ping', {});
      if (res !== 'pong') throw new Error('Unexpected response');
    })
    .on('cycle', (event: any) => {
      console.log(String(event.target));
    })
    .on('complete', () => {
      console.log('Fastest is ' + suite.filter('fastest').map('name'));
    })
    .run({async: true});
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
