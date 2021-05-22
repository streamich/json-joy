import {App} from 'uWebSockets.js';
import {enableCors, createConnectionContext, ConnectionContext, enableWsBinaryReactiveRpcApi, enableWsCompactReactiveRpcApi} from '../../reactive-rpc/server/uws';
import {sampleApi} from '../../reactive-rpc/common/rpc/__tests__/api';

const uws = App({});

enableCors(uws);

enableWsBinaryReactiveRpcApi<ConnectionContext>({
  uws,
  createContext: createConnectionContext,
  maxActiveCalls: 3,
  onCall: (name: string) => {
    if (!sampleApi.hasOwnProperty(name)) return undefined;
    return (sampleApi as any)[name];
  },
  onNotification: () => {},
});

enableWsCompactReactiveRpcApi<ConnectionContext>({
  uws,
  maxActiveCalls: 3,
  createContext: createConnectionContext,
  onCall: (name: string) => {
    if (!sampleApi.hasOwnProperty(name)) return undefined;
    return (sampleApi as any)[name];
  },
  onNotification: () => {},
});

const port = 9999;

uws.listen(port, (token) => {
  if (token) {
    console.log({msg: 'SERVER_STARTED', url: `http://localhost:${port}`});
  } else {
    console.error(`Failed to listen on ${port} port.`);
  }
});
