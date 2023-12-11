// npx ts-node src/redis-client/main.ts

import * as net from 'net';
import {RespEncoder} from '../json-pack/resp';
import {RespStreamingDecoder} from '../json-pack/resp/RespStreamingDecoder';
import {ReconnectingSocket} from './ReconnectingSocket';
import {RedisClient} from './RedisClient';

const main = async () => {
  const host = 'localhost';
  const port = 7000;
  const usr = 'default';
  const pwd = 'AoQhB7bNYljT8IiZ7nbgvSQSXiGHRwQX';

  const encoder = new RespEncoder();
  const decoder = new RespStreamingDecoder();
  const client = new RedisClient({
    socket: new ReconnectingSocket({
      createSocket: () => net.createConnection({
        host,
        port,
      }),
    }),
    encoder,
    decoder,
  });

  client.start();

  let res: unknown;

  // res = await client.cmd(['AUTH', usr, pwd]);
  // console.log('res', res);

  res = await client.cmd(['PING']);
  console.log('res', res);

  // res = await css', res);

  // socket.writeCmd('AUTH', usr, pwd);
  // socket.writeCmd('PING');
  // socket.writeCmd('SET', 'foo', 'bar');
  // socket.writeCmd('GET', 'foo');
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});