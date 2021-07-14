import {runApiTests, sampleApi} from './api';
import {RpcServer} from '../RpcServer';
import {RpcServerLocalClient} from '../RpcServerLocalClient'

const setup = () => {
  const server = RpcServer.fromApi<any, any>({
    send: (messages) => {},
    onNotification: () => {},
    api: sampleApi,
    bufferSize: 2,
    bufferTime: 1,
    maxActiveCalls: 3,
  });
  const client = new RpcServerLocalClient({
    ctx: {},
    server,
  });

  return {
    server,
    client,
  };
};

runApiTests(() => ({client: setup().client}));
