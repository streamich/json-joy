import type {Observable} from "rxjs";

export type RpcMethod<Context = unknown, Request = unknown, Response = unknown> =
  | RpcMethodStatic<Context, Request, Response>
  | RpcMethodStreaming<Context, Request, Response>;

export interface RpcMethodStatic<Context = unknown, Request = unknown, Response = unknown> {
  /**
   * Non-streaming method receives
   */
  isStreaming: false;

  /**
   * Validation logic. Should throw if request is invalid, not throw otherwise.
   * In case request is a stream, validation method is executed for every
   * emitted value.
   */
   validate?: (request: Request) => void;

  /**
   * Execute the static method.
   */
  call: (ctx: Context, request: Request) => Promise<Response>;
}

export interface RpcMethodStreaming<Context = unknown, Request = unknown, Response = unknown> {
  isStreaming: true;

  /**
   * Validation logic. Should throw if request is invalid, not throw otherwise.
   * In case request is a stream, validation method is executed for every
   * emitted value.
   */
   validate?: (request: Request) => void;

  /**
   * Execute the streaming method.
   */
  call$: (ctx: Context, request$: Observable<Request>) => Observable<Response>;

  /**
   * When call `request$` is a multi-value observable and request data is coming
   * in while pre-call check is still being executed, this property determines
   * how many `request$` values to buffer in memory before raising an error
   * and stopping the streaming call. Defaults to the `preCallBufferSize` param
   * set on the `RpcServer`.
   */
  preCallBufferSize?: number;
}

export type RpcApi<Context = unknown, T = unknown> = Record<string, RpcMethod<Context, T, T>>;
