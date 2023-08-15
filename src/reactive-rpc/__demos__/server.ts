// npx ts-node src/reactive-rpc/__demos__/server.ts

import {App} from 'uWebSockets.js';
import {createCaller} from '../common/rpc/__tests__/sample-api';
import {RpcApp} from '../server/uws/RpcApp';
import {Codecs} from '../../json-pack/codecs/Codecs';
import {Writer} from '../../util/buffers/Writer';

const uws = App({});
const caller = createCaller();
const codecs = new Codecs(new Writer());
const app = new RpcApp({
  uws,
  caller,
  codecs,
  maxRequestBodySize: 1024 * 1024,
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
