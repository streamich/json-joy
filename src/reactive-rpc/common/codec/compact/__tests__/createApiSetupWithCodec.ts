import {sampleApi} from '../../../rpc/__tests__/sample-api';
import {ApiTestSetup} from '../../../rpc/__tests__/runApiTests';
import {RpcMessageStreamProcessor} from '../../../rpc/RpcMessageStreamProcessor';
import {RpcClient} from '../../../rpc/RpcClient';
import {ReactiveRpcClientMessage, ReactiveRpcServerMessage} from '../../../messages';
import {ApiRpcCaller} from '../../../rpc/caller/ApiRpcCaller';

interface ApiSetupTestCodec {
  encoder: {
    encode(a: any): any;
  };
  decoder: {
    decode(a: any): any;
  };
}

export const createApiSetupWithCodec = (codec: ApiSetupTestCodec) => {
  const {encoder, decoder} = codec;
  const setup: ApiTestSetup = () => {
    const ctx = {ip: '127.0.0.1'};
    const server = new RpcMessageStreamProcessor<any>({
      send: (messages: unknown) => {
        const encoded = encoder.encode(messages);
        setTimeout(() => {
          const decoded = decoder.decode(encoded) as ReactiveRpcServerMessage | ReactiveRpcServerMessage[];
          if (decoded instanceof Array) client.onMessages(decoded);
          else client.onMessage(decoded);
        }, 1);
      },
      caller: new ApiRpcCaller<any, any>({
        api: sampleApi,
      }),
      bufferSize: 2,
      bufferTime: 1,
    });
    const client = new RpcClient({
      send: (messages) => {
        const encoded = encoder.encode(messages);
        setTimeout(() => {
          const decoded = decoder.decode(encoded) as ReactiveRpcClientMessage | ReactiveRpcClientMessage[];
          if (decoded instanceof Array) server.onMessages(decoded, ctx);
          else server.onMessage(decoded, ctx);
        }, 1);
      },
      bufferSize: 2,
      bufferTime: 1,
    });
    return {server, client};
  };
  return setup;
};
