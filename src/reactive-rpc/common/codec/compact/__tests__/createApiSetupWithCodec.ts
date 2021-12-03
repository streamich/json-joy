import {sampleApi, ApiTestSetup} from '../../../rpc/__tests__/api';
import {RpcServer} from '../../../rpc/RpcServer';
import {RpcClient} from '../../../rpc/RpcClient';
import {ReactiveRpcRequestMessage, ReactiveRpcResponseMessage} from '../../../messages/nominal';
import {RpcApiCaller} from '../../../rpc/RpcApiCaller';

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
    const server = new RpcServer<any, any>({
      send: (messages: unknown) => {
        const encoded = encoder.encode(messages);
        setTimeout(() => {
          const decoded = decoder.decode(encoded) as ReactiveRpcResponseMessage | ReactiveRpcResponseMessage[];
          if (decoded instanceof Array) client.onMessages(decoded);
          else client.onMessage(decoded);
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
        const encoded = encoder.encode(messages);
        setTimeout(() => {
          const decoded = decoder.decode(encoded) as ReactiveRpcRequestMessage | ReactiveRpcRequestMessage[];
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
