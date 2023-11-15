// Run: npx ts-node src/server/index.ts

import {App} from 'uWebSockets.js';
import {RpcApp} from '../reactive-rpc/server/uws/RpcApp';;
import {createCaller} from './routes';
import {Services} from './services/Services';
import type {MyCtx} from './services/types';

const app = new RpcApp<MyCtx>({
  uws: App({}),
  caller: createCaller(new Services()),
});
app.startWithDefaults();
