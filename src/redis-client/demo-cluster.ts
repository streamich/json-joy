// npx ts-node src/redis-client/demo-cluster.ts

import * as net from 'net';
import {RespEncoder} from '../json-pack/resp';
import {RespStreamingDecoder} from '../json-pack/resp/RespStreamingDecoder';
import {ReconnectingSocket} from './ReconnectingSocket';
import {RedisClient} from './RedisClient';
import {RedisClusterClient} from './RedisClusterClient';

const main = async () => {
  const host = 'localhost';
  const port = 7000;
  const user = 'default';
  const pwd = 'AoQhB7bNYljT8IiZ7nbgvSQSXiGHRwQX';

  const client = new RedisClusterClient({
    seeds: [
      {
        host,
        port,
        user,
        pwd,
      }
    ],
  });

  client.onError.listen((err) => {
    console.error('onError', err);
  });

  client.start();
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});