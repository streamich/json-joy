import {App} from 'uWebSockets.js';
import {enableCors, createConnectionContext, ConnectionContext, enableWsBinaryReactiveRpcApi, enableWsCompactReactiveRpcApi} from '../../reactive-rpc/server/uws';
import {sampleApi} from '../../reactive-rpc/common/rpc/__tests__/api';
import {formatError, formatErrorCode} from '../../reactive-rpc/common/rpc/error';
import {RpcServer} from '../../reactive-rpc/common/rpc';

const uws = App({});

enableCors(uws);

enableWsBinaryReactiveRpcApi<ConnectionContext>({
  uws,
  createContext: createConnectionContext,
  createRpcServer: ({send}) => new RpcServer({
    preCallBufferSize: 10,
    maxActiveCalls: 3,
    formatError,
    formatErrorCode,
    onCall: (name: string) => {
      if (!sampleApi.hasOwnProperty(name)) return undefined;
      return (sampleApi as any)[name];
    },
    onNotification: () => {},
    send,
  }),
});

enableWsCompactReactiveRpcApi<ConnectionContext>({
  uws,
  createContext: createConnectionContext,
  createRpcServer: ({send}) => new RpcServer({
    preCallBufferSize: 10,
    maxActiveCalls: 3,
    formatError,
    formatErrorCode,
    onCall: (name: string) => {
      if (!sampleApi.hasOwnProperty(name)) return undefined;
      return (sampleApi as any)[name];
    },
    onNotification: () => {},
    send,
  }),
});

const port = 9999;

uws.listen(port, (token) => {
  if (token) {
    console.log({msg: 'SERVER_STARTED', url: `http://localhost:${port}`});
  } else {
    console.error(`Failed to listen on ${port} port.`);
  }
});
