import {Codecs} from '../../../json-pack/codecs/Codecs';
import {Fuzzer} from '../../../util/Fuzzer';
import {Writer} from '../../../util/buffers/Writer';
import {ConnectionContext} from '../../server/context';
import {RpcCodecs} from '../codec/RpcCodecs';
import {RpcMessageCodecs} from '../codec/RpcMessageCodecs';
import {ReactiveRpcClientMessage, ReactiveRpcMessage, ReactiveRpcServerMessage} from '../messages';
import {RpcMessageStreamProcessor, StreamingRpcClient, TypedRpcClient} from '../rpc';
import type {FunctionStreamingType, FunctionType} from '../../../json-type/type/classes';
import type {Observable} from 'rxjs';
import type {ResolveType} from '../../../json-type';
import type {TypeRouter} from '../../../json-type/system/TypeRouter';
import type {TypeRouterCaller} from '../rpc/caller/TypeRouterCaller';

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
   * Minimum and maximum request latencies in milliseconds. An actual latency
   * number will be picked randomly between these two values. Defaults to
   * `[1, 1]`.
   */
  requestLatency?: [min: number, max: number];

  /**
   * Minimum and maximum response latencies in milliseconds. An actual latency
   * number will be picked randomly between these two values. Defaults to
   * `[1, 1]`.
   */
  responseLatency?: [min: number, max: number];

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

export const buildE2eClient = <Caller extends TypeRouterCaller<any>>(caller: Caller, opt: BuildE2eClientOptions) => {
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
      const latency = opt.responseLatency ?? [1, 1];
      setTimeout(() => {
        const decoded = ctx.msgCodec.decodeBatch(ctx.resCodec, encoded);
        client.onMessages(decoded as ReactiveRpcServerMessage[]);
      }, Fuzzer.randomInt(latency[0], latency[1]));
    },
    bufferSize: Fuzzer.randomInt2(opt.serverBufferSize ?? [1, 1]),
    bufferTime: Fuzzer.randomInt2(opt.serverBufferTime ?? [0, 0]),
  });
  client = new StreamingRpcClient({
    send: (messages: ReactiveRpcClientMessage[]) => {
      const encoded = ctx.msgCodec.encode(ctx.reqCodec, messages);
      const latency = opt.requestLatency ?? [1, 1];
      setTimeout(() => {
        const decoded = ctx.msgCodec.decodeBatch(ctx.reqCodec, encoded);
        streamProcessor.onMessages(decoded as ReactiveRpcClientMessage[], {});
      }, Fuzzer.randomInt(latency[0], latency[1]));
    },
    bufferSize: Fuzzer.randomInt2(opt.clientBufferSize ?? [1, 1]),
    bufferTime: Fuzzer.randomInt2(opt.clientBufferTime ?? [0, 0]),
  });
  type Router = UnTypeRouterCaller<Caller>;
  type Routes = UnTypeRouter<Router>;
  type Methods = {[K in keyof Routes]: UnwrapFunction<Routes[K]>};
  const typedClient = client as TypedRpcClient<Methods>;
  return {
    client: typedClient,
  };
};

type UnTypeRouterCaller<T> = T extends TypeRouterCaller<infer R> ? R : never;
type UnTypeRouter<T> = T extends TypeRouter<infer R> ? R : never;
type UnwrapFunction<F> = F extends FunctionType<infer Req, infer Res>
  ? (req: ResolveType<Req>) => Promise<ResolveType<Res>>
  : F extends FunctionStreamingType<infer Req, infer Res>
  ? (req$: Observable<ResolveType<Req>>) => Observable<ResolveType<Res>>
  : never;
