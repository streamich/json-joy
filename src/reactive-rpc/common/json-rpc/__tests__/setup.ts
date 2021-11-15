import {RpcApiCaller} from '../../rpc/RpcApiCaller';
import {sampleApi} from '../../rpc/__tests__/api';
import {JsonRpc2CodecJsonString} from '../codec/json-string/JsonRpc2CodecJsonString';
import {JsonRpc2CodecJson} from '../codec/json/JsonRpc2CodecJson';
import {JsonRpc2Codec} from '../codec/types';
import {JsonRpc2Server} from '../JsonRpc2Server';

export const setup = (codec: JsonRpc2Codec = new JsonRpc2CodecJson(), strict: boolean = false) => {
  const onNotification = jest.fn();
  const caller = new RpcApiCaller({
    api: sampleApi,
    maxActiveCalls: 3,
  });
  const server = new JsonRpc2Server<typeof sampleApi, unknown>({
    caller,
    codec,
    onNotification,
    strict,
  });

  return {onNotification, caller, codec, server};
};

export const setupWithStringCodec = () => {
  const codec = new JsonRpc2CodecJsonString();
  return setup(codec);
};
