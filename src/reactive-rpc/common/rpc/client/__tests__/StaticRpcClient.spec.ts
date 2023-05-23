import {RpcMessageBatchProcessor} from '../../RpcMessageBatchProcessor';
import {runApiTests} from '../../__tests__/runApiTests';
import {sampleApi} from '../../__tests__/sample-api';
import {ApiRpcCaller} from '../../caller/ApiRpcCaller';
import {StaticRpcClient} from '../StaticRpcClient';

const setup = () => {
  const ctx = {ip: '127.0.0.1'};
  const server = new RpcMessageBatchProcessor<any>({
    caller: new ApiRpcCaller<any, any>({
      api: sampleApi,
    }),
  });
  const client = new StaticRpcClient({
    send: async (messages) => await server.onBatch(messages as any, ctx),
    bufferSize: 2,
    bufferTime: 1,
  });
  return {server, client};
};

runApiTests(setup);
