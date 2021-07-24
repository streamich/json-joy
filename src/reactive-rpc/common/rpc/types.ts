import type {Observable} from "rxjs";

export type RpcMethod<Context = unknown, Request = unknown, Response = unknown> =
  | RpcMethodStatic<Context, Request, Response>
  | RpcMethodStreaming<Context, Request, Response>;

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
  validate?(request: Request): void;

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
  onPreCall?(ctx: Context, request: Request): Promise<void>;
}

export interface RpcMethodStatic<Context = unknown, Request = unknown, Response = unknown> extends RpcMethodBase<Context, Request> {
  /**
   * Identifies a special cases of non-streaming method.
   */
  isStreaming: false;

  /**
   * Execute the static method.
   */
  call(ctx: Context, request: Request): Promise<Response>;
}

export interface RpcMethodStreaming<Context = unknown, Request = unknown, Response = unknown> extends RpcMethodBase<Context, Request> {
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

  /**
   * Time in milliseconds after which to timeout the call if there is no activity
   * in request or response observables. Usually defaults to 15,000 milliseconds.
   */
  timeout?: number;

  /**
   * Execute the streaming method.
   */
  call$(ctx: Context, request$: Observable<Request>): Observable<Response>;
}

export type RpcApi<Context = unknown, T = unknown> = Record<string, RpcMethod<Context, T, T>>;

export interface IRpcApiCaller<Api extends Record<string, RpcMethod<Ctx, any, any>>, Ctx = unknown> {
  exists<K extends keyof Api>(name: K): boolean;
  get<K extends keyof Api>(name: K): Api[K];
  call<K extends keyof Api>(name: K, request: RpcMethodRequest<Api[K]>, ctx: Ctx): Promise<RpcMethodResponse<Api[K]>>;
  call$<K extends keyof Api>(name: K, request$: Observable<RpcMethodRequest<Api[K]>>, ctx: Ctx): Observable<RpcMethodResponse<Api[K]>>;
}
