// npx ts-node src/redis-client/main.ts

import * as net from 'net';
import {RespEncoder} from '../json-pack/resp';
import {RespStreamingDecoder} from '../json-pack/resp/RespStreamingDecoder';
import {ReconnectingSocket} from './ReconnectingSocket';
import {RedisSocket} from './RedisSocket';

const host = 'redis-13183.c325.us-east-1-4.ec2.redns.redis-cloud.com';
const port = 13183;
const usr = 'default';
const pwd = 'AoQhB7bNYljT8IiZ7nbgvSQSXiGHRwQX';

const encoder = new RespEncoder();
const decoder = new RespStreamingDecoder();
const socket = new RedisSocket({
  socket: new ReconnectingSocket({
    createSocket: () => net.createConnection({
      host,
      port,
    }),
  }),
  encoder,
  decoder,
});

socket.start();

socket.writeCmd('AUTH', usr, pwd);
socket.writeCmd('PING');
socket.writeCmd('SET', 'foo', 'bar');
socket.writeCmd('GET', 'foo');
