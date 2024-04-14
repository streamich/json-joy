// Run: npx ts-node src/server/index.ts

import {App} from 'uWebSockets.js';
import {RpcApp} from '../reactive-rpc/server/uws/RpcApp';
import {createCaller} from './routes';
import {Services} from './services/Services';
import type {MyCtx} from './services/types';
import {RpcServer} from '../reactive-rpc/server/http1/RpcServer';

export type JsonJoyDemoRpcCaller = ReturnType<typeof createCaller>['caller'];

const app = new RpcApp<MyCtx>({
  uws: App({}),
  caller: createCaller(new Services()).caller,
});
app.startWithDefaults();

// const server = RpcServer.startWithDefaults({
//   port: 9999,
//   caller: createCaller(new Services()).caller,
//   logger: console,
// });
