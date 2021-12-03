import type {Observable} from 'rxjs';
import type {json_string} from '../../../json-brand';
import type {MsgPack} from '../../../json-pack';
import type {RpcMethodStaticWrap, RpcMethodStreamingWrap} from './methods';

export type RpcMethod<Context = unknown, Request = unknown, Response = unknown> =
  | RpcMethodStatic<Context, Request, Response>
  | RpcMethodStreaming<Context, Request, Response>;

export type RpcMethodContext<T> = T extends RpcMethod<infer U, any, any> ? U : never;
export type RpcMethodRequest<T> = T extends RpcMethod<any, infer U, any> ? U : never;
export type RpcMethodResponse<T> = T extends RpcMethod<any, any, infer U> ? U : never;

export interface RpcMethodBase<Context = unknown, Request = unknown> {
  /**
   * Non-streaming method receives
   */
  isStreaming: boolean;

  /**
   * Validation logic. Should throw if request is invalid, not throw otherwise.
   * In case request is a stream, validation method is executed for every
   * emitted value.
   */
  validate?: (request: Request) => void;

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
  onPreCall?: (ctx: Context, request: Request) => Promise<void>;

  /**
   * Whether to pretty print the response.
   */
  pretty?: boolean;

  /** Type ref of the method request, can be used for validation. */
  req?: string;

  /** Type ref of the method response, can be used for serialization. */
  res?: string;
}

export interface RpcMethodStatic<Context = unknown, Request = unknown, Response = unknown>
  extends RpcMethodBase<Context, Request> {
  /**
   * Identifies a special cases of non-streaming method.
   */
  isStreaming: false;

  call?: (ctx: Context, request: Request) => Promise<Response>;
  callJson?: (ctx: Context, request: Request) => Promise<json_string<Response>>;
  callMsgPack?: (ctx: Context, request: Request) => Promise<MsgPack<Response>>;
}

export interface RpcMethodStreaming<Context = unknown, Request = unknown, Response = unknown>
  extends RpcMethodBase<Context, Request> {
  /**
   * Identifies a streaming method, where, both, request and response are Rx
   * observables.
   */
  isStreaming: true;

  /**
   * When call `request$` is a multi-value observable and request data is coming
   * in while pre-call check is still being executed, this property determines
   * how many `request$` values to buffer in memory before raising an error
   * and stopping the streaming call. Defaults to the `preCallBufferSize` param
   * set on the `RpcServer`.
   */
  preCallBufferSize?: number;

  call$?: (ctx: Context, request$: Observable<Request>) => Observable<Response>;
  callJson$?: (ctx: Context, request$: Observable<Request>) => Observable<json_string<Response>>;
  callMsgPack$?: (ctx: Context, request$: Observable<Request>) => Observable<MsgPack<Response>>;
}


export type RpcMethodWrap<Context = unknown, Request = unknown, Response = unknown> =
  | RpcMethodStaticWrap<Context, Request, Response>
  | RpcMethodStreamingWrap<Context, Request, Response>;

export type RpcMethodWrapFromRpcMethod<T> = T extends RpcMethod<infer A, infer B, infer C> ? RpcMethodWrap<A, B, C> : never;

export type RpcApi<Context = unknown, T = unknown> = Record<string, RpcMethod<Context, T, T>>;

export interface IRpcApiCaller<Api extends Record<string, RpcMethod<Ctx, any, any>>, Ctx = unknown> {
  exists<K extends keyof Api>(name: K): boolean;
  get<K extends keyof Api>(name: K): RpcMethodWrapFromRpcMethod<Api[K]>;
  call<K extends keyof Api>(name: K, request: RpcMethodRequest<Api[K]>, ctx: Ctx): Promise<RpcMethodResponse<Api[K]>>;
  callJson<K extends keyof Api>(name: K, request: RpcMethodRequest<Api[K]>, ctx: Ctx): Promise<json_string<RpcMethodResponse<Api[K]>>>;
  callMsgPack<K extends keyof Api>(name: K, request: RpcMethodRequest<Api[K]>, ctx: Ctx): Promise<MsgPack<RpcMethodResponse<Api[K]>>>;
  call$<K extends keyof Api>(
    name: K,
    request$: Observable<RpcMethodRequest<Api[K]>>,
    ctx: Ctx,
  ): Observable<RpcMethodResponse<Api[K]>>;
  callJson$<K extends keyof Api>(
    name: K,
    request$: Observable<RpcMethodRequest<Api[K]>>,
    ctx: Ctx,
  ): Observable<json_string<RpcMethodResponse<Api[K]>>>;
  callMsgPack$<K extends keyof Api>(
    name: K,
    request$: Observable<RpcMethodRequest<Api[K]>>,
    ctx: Ctx,
  ): Observable<MsgPack<RpcMethodResponse<Api[K]>>>;
}
