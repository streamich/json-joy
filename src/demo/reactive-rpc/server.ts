import {App} from 'uWebSockets.js';
import {enableCors, createConnectionContext, ConnectionContext, enableWsBinaryReactiveRpcApi, enableWsCompactReactiveRpcApi} from '../../reactive-rpc/server/uws';
import {sampleApi} from '../../reactive-rpc/common/rpc/__tests__/api';
import {RpcServer} from '../../reactive-rpc/common/rpc';
import {RpcApiCaller} from '../../reactive-rpc/common/rpc/RpcApiCaller';
import {enableHttpGetRpcApi, enableHttpPostRpcApi} from '../../reactive-rpc/server/uws/http/static';
import {enableSseGetRpcApi, enableSsePostRpcApi} from '../../reactive-rpc/server/uws/http/sse';
import {UwsHttpBaseContext} from '../../reactive-rpc/server/uws/http/types';
import {enableNdjsonGetRpcApi, enableNdjsonPostRpcApi} from '../../reactive-rpc/server/uws/http/ndjson';

const uws = App({});

enableCors(uws);

const caller = new RpcApiCaller<any, any>({
  api: sampleApi,
  maxActiveCalls: 3,
  preCallBufferSize: 10,
});

enableWsBinaryReactiveRpcApi<ConnectionContext>({
  uws,
  createContext: createConnectionContext,
  createRpcServer: ({send}) => new RpcServer({
    caller,
    onNotification: () => {},
    send,
  }),
});

enableWsCompactReactiveRpcApi<ConnectionContext>({
  uws,
  createContext: createConnectionContext,
  createRpcServer: ({send}) => new RpcServer({
    caller,
    onNotification: () => {},
    send,
  }),
});

enableHttpPostRpcApi<ConnectionContext & UwsHttpBaseContext>({
  uws,
  caller,
  createContext: createConnectionContext,
});

enableHttpGetRpcApi<ConnectionContext & UwsHttpBaseContext>({
  uws,
  caller,
  createContext: createConnectionContext,
});

enableSsePostRpcApi<ConnectionContext & UwsHttpBaseContext>({
  uws,
  caller,
  createContext: createConnectionContext,
});

enableSseGetRpcApi<ConnectionContext & UwsHttpBaseContext>({
  uws,
  caller,
  createContext: createConnectionContext,
});

enableNdjsonPostRpcApi<ConnectionContext & UwsHttpBaseContext>({
  uws,
  caller,
  createContext: createConnectionContext,
});

enableNdjsonGetRpcApi<ConnectionContext & UwsHttpBaseContext>({
  uws,
  caller,
  createContext: createConnectionContext,
});

const port = 9999;

uws.listen(port, (token) => {
  if (token) {
    console.log({msg: 'SERVER_STARTED', url: `http://localhost:${port}`});
  } else {
    console.error(`Failed to listen on ${port} port.`);
  }
});
