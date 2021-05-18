import {App} from 'uWebSockets.js';

import {enableWsBinaryReactiveRpcApi, enableCors, createConnectionContext, ConnectionContext} from '../../src/reactive-rpc/server/uws';

const uws = App({});

enableCors(uws);
enableWsBinaryReactiveRpcApi<ConnectionContext>({
  uws,
  createContext: createConnectionContext,
  onCall: (name: string) => {
    return {
      isStreaming: false,
      call: async () => 'pong',
    };
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
