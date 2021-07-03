import type {Observable} from "rxjs";

export type RpcMethod<Context = unknown, Request = unknown, Response = unknown> =
  | RpcMethodStatic<Context, Request, Response>
  | RpcMethodStreaming<Context, Request, Response>;

export interface RpcMethodStatic<Context = unknown, Request = unknown, Response = unknown> {
  isStreaming: false;

  /**
   * Execute the static method.
   */
  call: (ctx: Context, request: Request) => Promise<Response>;

  /**
   * Validation logic. Should throw if request is invalid, not throw otherwise.
   * In case request is a stream, validation method is executed for every
   * emitted value.
   */
   validate?: (request: Request) => void;
}

export interface RpcMethodStreaming<Context = unknown, Request = unknown, Response = unknown> {
  isStreaming: true;

  /**
   * Execute the streaming method.
   */
  call$: (ctx: Context, request$: Observable<Request>) => Observable<Response>;

  /**
   * Validation logic. Should throw if request is invalid, not throw otherwise.
   * In case request is a stream, validation method is executed for every
   * emitted value.
   */
   validate?: (request: Request) => void;
}

export type RpcApi<Context = unknown, T = unknown> = Record<string, RpcMethod<Context, T, T>>;
