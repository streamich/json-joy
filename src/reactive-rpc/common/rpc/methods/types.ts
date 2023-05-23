import type {Observable} from 'rxjs';
import type {Type} from '../../../../json-type';

export interface IRpcMethodBase<Ctx = unknown, Req = unknown, Res = unknown> {
  /**
   * Specifies if request or response of the method could be a stream.
   */
  isStreaming: boolean;

  /**
   * Validation logic. Should throw if request is invalid, not throw otherwise.
   * In case request is a stream, validation method is executed for every
   * emitted value.
   */
  validate?: (request: Req) => void;

  /**
   * Method which is executed before an actual call to an RPC method. Pre-call
   * checks should execute all necessary checks (such as authentication,
   * authorization, throttling, etc.) before allowing the real method to
   * proceed. Pre-call checks should throw, if for any reason the call should
   * not proceed. Return void to allow execution of the actual call.
   *
   * @param ctx Request context object.
   * @param request Request payload, the first emitted value in case of
   *                streaming request.
   */
  onPreCall?: (ctx: Ctx, request: Req) => Promise<void>;

  /**
   * Whether to pretty print the response.
   */
  pretty?: boolean;

  req?: Type;
  res?: Type;

  call: (request: Req, ctx: Ctx) => Promise<Res>;
  call$: (request$: Observable<Req>, ctx: Ctx) => Observable<Res>;
}

export interface IStaticRpcMethod<Ctx = unknown, Req = unknown, Res = unknown>
  extends Omit<IRpcMethodBase<Ctx, Req, Res>, 'call$'> {
  isStreaming: false;
}

export interface IStreamingRpcMethod<Ctx = unknown, Req = unknown, Res = unknown>
  extends Omit<IRpcMethodBase<Ctx, Req, Res>, 'call'> {
  isStreaming: true;

  /**
   * When call `request$` is a multi-value observable and request data is coming
   * in while pre-call check is still being executed, this property determines
   * how many `request$` values to buffer in memory before raising an error
   * and stopping the streaming call. Defaults to the `preCallBufferSize` param
   * set on the `RpcServer`.
   */
  preCallBufferSize?: number;
}

export type RpcMethod<Ctx = unknown, Req = unknown, Res = unknown> =
  | IStaticRpcMethod<Ctx, Req, Res>
  | IStreamingRpcMethod<Ctx, Req, Res>;

export type RpcMethodMap<Ctx = unknown> = {[name: string]: RpcMethod<Ctx>};
