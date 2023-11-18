import {Codecs} from '../../json-pack/codecs/Codecs';
import {ReactiveRpcClientMessage, ReactiveRpcMessage, ReactiveRpcServerMessage, RpcMessageBatchProcessor, RpcMessageStreamProcessor, StreamingRpcClient} from '../../reactive-rpc/common';
import {RpcCodecs} from '../../reactive-rpc/common/codec/RpcCodecs';
import {RpcMessageCodecs} from '../../reactive-rpc/common/codec/RpcMessageCodecs';
import {ConnectionContext} from '../../reactive-rpc/server/context';
import {Writer} from '../../util/buffers/Writer';
import {createCaller} from '../routes';
import {Services} from '../services/Services';

export const setup = () => {
  const services = new Services();
  const caller = createCaller(services);
  const call = caller.callSimple.bind(caller);
  const writer = new Writer();
  const codecs = new RpcCodecs(new Codecs(writer), new RpcMessageCodecs());
  const batchProcessor = new RpcMessageBatchProcessor({caller});
  const ctx = new ConnectionContext('0.0.0.0', '', null, {}, codecs.value.cbor, codecs.value.cbor, codecs.messages.binary);
  let client: StreamingRpcClient;
  const streamProcessor = new RpcMessageStreamProcessor({
    caller,
    send: (messages: ReactiveRpcMessage[]) => {
      const encoded = ctx.msgCodec.encode(ctx.resCodec, messages);
      setTimeout(() => {
        const decoded = ctx.msgCodec.decodeBatch(ctx.resCodec, encoded);
        client.onMessages(decoded as ReactiveRpcServerMessage[]);
      }, 1); // TODO: Randomize this
    },
    bufferSize: 1, // TODO: Randomize this
    bufferTime: 0, // TODO: Randomize this
  });
  client = new StreamingRpcClient({
    send: (messages: ReactiveRpcClientMessage[]) => {
      const encoded = ctx.msgCodec.encode(ctx.reqCodec, messages);
      setTimeout(() => {
        const decoded = ctx.msgCodec.decodeBatch(ctx.reqCodec, encoded);
        streamProcessor.onMessages(decoded as ReactiveRpcClientMessage[], {});
      }, 1); // TODO: Randomize this
    },
    bufferSize: 1, // TODO: Randomize this
    bufferTime: 0, // TODO: Randomize this
  });
  return {services, caller, call, client};
};
