import {runApiTests, sampleApi} from './api';
import {RpcServer} from '../RpcServer';
import {RpcServerLocalClient} from '../RpcServerLocalClient';
import {RpcApiCaller} from '../RpcApiCaller';

const setup = () => {
  const server = new RpcServer<any, any>({
    send: (messages) => {},
    onNotification: () => {},
    caller: new RpcApiCaller<any, any>({
      api: sampleApi,
      maxActiveCalls: 3,
    }),
    bufferSize: 2,
    bufferTime: 1,
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
