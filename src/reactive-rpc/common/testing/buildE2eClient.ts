import {Codecs} from '@jsonjoy.com/json-pack/lib/codecs/Codecs';
import {Fuzzer} from '@jsonjoy.com/util/lib/Fuzzer';
import {Writer} from '@jsonjoy.com/util/lib/buffers/Writer';
import {ConnectionContext} from '../../server/context';
import {RpcCodecs} from '../codec/RpcCodecs';
import {RpcMessageCodecs} from '../codec/RpcMessageCodecs';
import {ReactiveRpcClientMessage, ReactiveRpcMessage, ReactiveRpcServerMessage} from '../messages';
import {RpcMessageStreamProcessor, StreamingRpcClient, TypedRpcClient} from '../rpc';
import type {RpcCaller} from '../rpc/caller/RpcCaller';
import type {CallerToMethods} from '../types';

export interface BuildE2eClientOptions {
  /**
   * Writer to use for encoding messages. Defaults to `new Writer(4 * 1024)`.
   */
  writer?: Writer;

  /**
   * Minimum and maximum size of the default buffer in kilobytes. An actual
   * size will be picked randomly between these two values. Defaults to
   * `[4, 4]`. Used when `writer` is not specified.
   */
  writerDefaultBufferKb?: [min: number, max: number];

  /**
   * Number of messages to keep in buffer before sending them to the client.
   * The actual number of messages will be picked randomly between these two
   * values. Defaults to `[1, 1]`.
   */
  serverBufferSize?: [min: number, max: number];

  /**
   * Time in milliseconds for how long to buffer messages before sending them
   * to the client. The actual time will be picked randomly between these two
   * values. Defaults to `[0, 0]`.
   */
  serverBufferTime?: [min: number, max: number];

  /**
   * Number of messages to keep in buffer before sending them to the server.
   * The actual number of messages will be picked randomly between these two
   * values. Defaults to `[1, 1]`.
   */
  clientBufferSize?: [min: number, max: number];

  /**
   * Time in milliseconds for how long to buffer messages before sending them
   * to the server. The actual time will be picked randomly between these two
   * values. Defaults to `[0, 0]`.
   */
  clientBufferTime?: [min: number, max: number];

  /**
   * IP address to use for the connection. Defaults to `0.0.0.0`.
   */
  ip?: string;

  /**
   * Authentication token to use for the connection. Defaults to empty string.
   */
  token?: string;
}

export const buildE2eClient = <Caller extends RpcCaller<any>>(caller: Caller, opt: BuildE2eClientOptions = {}) => {
  const writer = opt.writer ?? new Writer(Fuzzer.randomInt2(opt.writerDefaultBufferKb ?? [4, 4]) * 1024);
  const codecs = new RpcCodecs(new Codecs(writer), new RpcMessageCodecs());
  const ctx = new ConnectionContext(
    opt.ip ?? '0.0.0.0',
    opt.ip ?? '',
    null,
    {},
    codecs.value.cbor,
    codecs.value.cbor,
    codecs.messages.binary,
  );
  let client: StreamingRpcClient;
  const streamProcessor = new RpcMessageStreamProcessor({
    caller,
    send: (messages: ReactiveRpcMessage[]) => {
      const encoded = ctx.msgCodec.encode(ctx.resCodec, messages);
      setTimeout(() => {
        const decoded = ctx.msgCodec.decodeBatch(ctx.resCodec, encoded);
        client.onMessages(decoded as ReactiveRpcServerMessage[]);
      }, 1);
    },
    bufferSize: Fuzzer.randomInt2(opt.serverBufferSize ?? [1, 1]),
    bufferTime: Fuzzer.randomInt2(opt.serverBufferTime ?? [0, 0]),
  });
  client = new StreamingRpcClient({
    send: (messages: ReactiveRpcClientMessage[]) => {
      const encoded = ctx.msgCodec.encode(ctx.reqCodec, messages);
      setTimeout(() => {
        const decoded = ctx.msgCodec.decodeBatch(ctx.reqCodec, encoded);
        streamProcessor.onMessages(decoded as ReactiveRpcClientMessage[], {});
      }, 1);
    },
    bufferSize: Fuzzer.randomInt2(opt.clientBufferSize ?? [1, 1]),
    bufferTime: Fuzzer.randomInt2(opt.clientBufferTime ?? [0, 0]),
  });
  const typedClient = client as TypedRpcClient<CallerToMethods<Caller>>;
  return {
    client: typedClient,
  };
};
