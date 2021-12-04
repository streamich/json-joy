import {runApiTests, sampleApi} from './api';
import {RpcServer} from '../RpcServer';
import {RpcClient} from '../RpcClient';
import {RpcApiCaller} from '../RpcApiCaller';

const setup = () => {
  const ctx = {ip: '127.0.0.1'};
  const server = new RpcServer<any>({
    send: (messages: any) => {
      setTimeout(() => {
        client.onMessages(messages);
      }, 1);
    },
    onNotification: () => {},
    caller: new RpcApiCaller<any, any>({
      api: sampleApi,
      maxActiveCalls: 3,
    }),
    bufferSize: 2,
    bufferTime: 1,
  });
  const client = new RpcClient({
    send: (messages) => {
      setTimeout(() => {
        server.onMessages(messages, ctx);
      }, 1);
    },
    bufferSize: 2,
    bufferTime: 1,
  });
  return {server, client};
};

runApiTests(setup);
