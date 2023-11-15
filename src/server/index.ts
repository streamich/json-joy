// Run: npx ts-node src/server/index.ts

import {App} from 'uWebSockets.js';
import {RpcApp} from '../reactive-rpc/server/uws/RpcApp';
import {Codecs} from '../json-pack/codecs/Codecs';
import {Writer} from '../util/buffers/Writer';
import {createCaller} from './routes';
import {Services} from './services/Services';
import type {RpcCaller} from '../reactive-rpc/common/rpc/caller/RpcCaller';
import type {MyCtx} from './services/types';

const uws = App({});
const codecs = new Codecs(new Writer());
const services = new Services();
const caller = createCaller(services);
const app = new RpcApp<MyCtx>({
  uws,
  caller: caller as RpcCaller<MyCtx>,
  codecs,
  maxRequestBodySize: 1024 * 1024,
  augmentContext: (ctx) => ctx,
});

app.enableCors();
app.enableHttpPing();
app.route('POST', '/echo', async (ctx) => {
  const json = await ctx.requestBodyJson(1024);
  return json;
});
app.enableHttpRpc();
app.enableWsRpc();
app.startRouting();

const port = +(process.env.PORT || 9999);

uws.listen(port, (token) => {
  if (token) {
    // tslint:disable-next-line no-console
    console.log({msg: 'SERVER_STARTED', url: `http://localhost:${port}`});
  } else {
    // tslint:disable-next-line no-console
    console.error(`Failed to listen on ${port} port.`);
  }
});
