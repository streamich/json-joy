import {ApiTestSetup, runApiTests, sampleApi} from './api';
import {RpcServer} from '../RpcServer';
import {RpcClient} from '../RpcClient';
import {RpcDuplex} from '../RpcDuplex';
import {RpcApiCaller} from '../RpcApiCaller';

const setup = () => {
  const server = new RpcDuplex({
    client: new RpcClient({
      send: (messages) => {
        setTimeout(() => {
          client.onMessages(messages, {ip: '127.0.0.1'});
        }, 1);
      },
      bufferSize: 2,
      bufferTime: 1,
    }),
    server: new RpcServer<any, any>({
      send: (messages: any) => {
        setTimeout(() => {
          client.onMessages(messages, {ip: '127.0.0.1'});
        }, 1);
      },
      onNotification: () => {},
      caller: new RpcApiCaller<any, any>({
        api: sampleApi,
        maxActiveCalls: 3,
      }),
      bufferSize: 2,
      bufferTime: 1,
    }),
  });
  const client = new RpcDuplex({
    client: new RpcClient({
      send: (messages) => {
        setTimeout(() => {
          server.onMessages(messages, {ip: '127.0.0.1'});
        }, 1);
      },
      bufferSize: 2,
      bufferTime: 1,
    }),
    server: new RpcServer<any, any>({
      send: (messages: any) => {
        setTimeout(() => {
          server.onMessages(messages, {ip: '127.0.0.1'});
        }, 1);
      },
      onNotification: () => {},
      caller: new RpcApiCaller<any, any>({
        api: sampleApi,
        maxActiveCalls: 3,
      }),
      bufferSize: 2,
      bufferTime: 1,
    }),
  });
  return {server, client};
};

const setup1: ApiTestSetup = () => ({client: setup().client});
const setup2: ApiTestSetup = () => ({client: setup().server});

describe('duplex 1', () => {
  runApiTests(setup1);
});

describe('duplex 2', () => {
  runApiTests(setup2);
});
