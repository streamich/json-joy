import {App} from 'uWebSockets.js';
import {
  enableCors,
  createConnectionContext,
  ConnectionContext,
  enableWsBinaryReactiveRpcApi,
  enableWsCompactReactiveRpcApi,
} from '../../reactive-rpc/server/uws';
import {sampleApi} from '../../reactive-rpc/common/rpc/__tests__/api';
import {RpcMethodStatic, RpcServer} from '../../reactive-rpc/common/rpc';
import {RpcApiCaller} from '../../reactive-rpc/common/rpc/RpcApiCaller';
import {
  enableHttpRpcJsonGetApi,
  enableHttpRpcJsonPostApi,
  enableHttpRpcMsgPackGetApi,
  enableHttpRpcMsgPackPostApi,
  enableSseGetRpcApi,
  enableSsePostRpcApi,
  enableHttpJsonRPC2Api,
} from '../../reactive-rpc/server/uws/http';
import {UwsHttpBaseContext} from '../../reactive-rpc/server/uws/http/types';
import {enableNdjsonGetRpcApi, enableNdjsonPostRpcApi} from '../../reactive-rpc/server/uws/http/ndjson';
import {RpcServerMsgPack} from '../../reactive-rpc/common/rpc/RpcServerMsgPack';

const uws = App({});

enableCors(uws);

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

const onNotification = (name: string, data: unknown, ctx: ConnectionContext & UwsHttpBaseContext): void => {
  switch (name) {
    case 'set-int': {
      theInt = Number(data as any);
      return;
    }
  }
};

enableWsBinaryReactiveRpcApi<ConnectionContext>({
  uws,
  createContext: createConnectionContext,
  createRpcServer: ({send}) =>
    new RpcServerMsgPack({
      caller,
      onNotification,
      send,
    }),
});

enableWsCompactReactiveRpcApi<ConnectionContext>({
  uws,
  createContext: createConnectionContext,
  createRpcServer: ({send}) =>
    new RpcServer({
      caller,
      onNotification,
      send,
    }),
  createRpcServerMsgPack: ({send}) =>
    new RpcServerMsgPack({
      caller,
      onNotification,
      send,
    }),
});

const options = {
  uws,
  caller,
  createContext: createConnectionContext,
  onNotification,
};

enableHttpRpcJsonGetApi<ConnectionContext & UwsHttpBaseContext>(options);
enableHttpRpcJsonPostApi<ConnectionContext & UwsHttpBaseContext>(options);
enableHttpRpcMsgPackGetApi<ConnectionContext & UwsHttpBaseContext>(options);
enableHttpRpcMsgPackPostApi<ConnectionContext & UwsHttpBaseContext>(options);
enableSsePostRpcApi<ConnectionContext & UwsHttpBaseContext>(options);
enableSseGetRpcApi<ConnectionContext & UwsHttpBaseContext>(options);
enableNdjsonPostRpcApi<ConnectionContext & UwsHttpBaseContext>(options);
enableNdjsonGetRpcApi<ConnectionContext & UwsHttpBaseContext>(options);
enableHttpJsonRPC2Api<ConnectionContext & UwsHttpBaseContext>(options);

const port = 9999;

uws.listen(port, (token) => {
  if (token) {
    console.log({msg: 'SERVER_STARTED', url: `http://localhost:${port}`});
  } else {
    console.error(`Failed to listen on ${port} port.`);
  }
});
