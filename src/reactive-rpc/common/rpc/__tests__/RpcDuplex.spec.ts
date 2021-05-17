import {ApiTestSetup, runApiTests, sampleApi} from './api';
import {RpcServer, RpcServerError} from '../RpcServer';
import {RpcClient} from '../RpcClient';
import {RpcDuplex} from '../RpcDuplex';

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
    server: RpcServer.fromApi<any, any>({
      send: (messages) => {
        setTimeout(() => {
          client.onMessages(messages, {ip: '127.0.0.1'});
        }, 1);
      },
      notify: () => {},
      api: sampleApi,
      bufferSize: 2,
      bufferTime: 1,
      maxActiveCalls: 3,
      formatError: (error: unknown) => {
        if (error instanceof Error) return {message: error.message};
        return error;
      },
      formatErrorCode: (code: RpcServerError) => {
        return {
          message: 'PROTOCOL',
          code,
        };
      },
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
    server: RpcServer.fromApi<any, any>({
      send: (messages) => {
        setTimeout(() => {
          server.onMessages(messages, {ip: '127.0.0.1'});
        }, 1);
      },
      notify: () => {},
      api: sampleApi,
      bufferSize: 2,
      bufferTime: 1,
      maxActiveCalls: 3,
      formatError: (error: unknown) => {
        if (error instanceof Error) return {message: error.message};
        return error;
      },
      formatErrorCode: (code: RpcServerError) => {
        return {
          message: 'PROTOCOL',
          code,
        };
      },
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
