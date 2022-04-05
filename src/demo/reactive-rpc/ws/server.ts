import {
  createConnectionContext,
  ConnectionContext,
  enableWsBinaryReactiveRpcApi,
} from '../../../reactive-rpc/server/ws';
import {sampleApi} from '../../../reactive-rpc/common/rpc/__tests__/api';
import {RpcMethodStatic} from '../../../reactive-rpc/common/rpc';
import {RpcApiCaller} from '../../../reactive-rpc/common/rpc/RpcApiCaller';
import {RpcServerMsgPack} from '../../../reactive-rpc/common/rpc/RpcServerMsgPack';
const {WebSocketServer} = require('ws');

let theInt = 0;

const getInt: RpcMethodStatic<object, any, number> = {
  isStreaming: false,
  call: async () => {
    return theInt;
  },
};

const caller = new RpcApiCaller<any, any>({
  api: {...sampleApi, getInt},
  maxActiveCalls: 3,
  preCallBufferSize: 10,
});

const onNotification = (name: string, data: unknown, ctx: any): void => {
  switch (name) {
    case 'set-int': {
      theInt = Number(data as any);
      return;
    }
  }
};

const port = 9999;

const wss = new WebSocketServer({
  port,
  path: '/rpc/binary',
});

enableWsBinaryReactiveRpcApi<ConnectionContext>({
  wss,
  createContext: createConnectionContext,
  createRpcServer: ({send}) =>
    new RpcServerMsgPack({
      caller,
      onNotification,
      send,
    }),
});

wss.on('listening', () => {
  // tslint:disable-next-line no-console
  console.log({msg: 'SERVER_STARTED', url: `http://localhost:${port}`});
});
