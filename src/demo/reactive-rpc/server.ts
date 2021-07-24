import {App} from 'uWebSockets.js';
import {enableCors, createConnectionContext, ConnectionContext, enableWsBinaryReactiveRpcApi, enableWsCompactReactiveRpcApi} from '../../reactive-rpc/server/uws';
import {sampleApi} from '../../reactive-rpc/common/rpc/__tests__/api';
import {RpcServer} from '../../reactive-rpc/common/rpc';
import {RpcApiCaller} from '../../reactive-rpc/common/rpc/RpcApiCaller';
import {enableHttpPostRpcApi, UwsHttpBaseContext} from '../../reactive-rpc/server/uws/http/static';

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

const port = 9999;

uws.listen(port, (token) => {
  if (token) {
    console.log({msg: 'SERVER_STARTED', url: `http://localhost:${port}`});
  } else {
    console.error(`Failed to listen on ${port} port.`);
  }
});
