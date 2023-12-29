// npx ts-node src/reactive-rpc/__demos__/ws.ts

import {createCaller} from '../common/rpc/__tests__/sample-api';
import {RpcServer} from '../server/http1/RpcServer';

const server = RpcServer.startWithDefaults({
  port: 3000,
  caller: createCaller(),
  logger: console,
});

// tslint:disable-next-line no-console
console.log(server + '');
