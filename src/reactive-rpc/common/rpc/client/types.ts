import type {Observable} from 'rxjs';

export interface RpcClient {
  /**
   * Execute a streaming RPC method.
   *
   * @param method RPC method name.
   * @param data RPC method static payload or stream of data.
   */
  call$(method: string, data: unknown | Observable<unknown>): Observable<unknown>;

  /**
   * Execute a one-way RPC method.
   *
   * @param method RPC method name.
   * @param request RPC method static payload.
   */
  call(method: string, request: unknown): Promise<unknown>;

  /**
   * Send a one-way notification message without expecting any response.
   *
   * @param method Remote method name.
   * @param data Static payload data.
   */
  notify(method: string, data: undefined | unknown): void;

  // start(): void;
  // stop(): void;
}

type TypedRpcClientFn<Request, Response> = (req: Request) => Promise<Response>;
type TypedRpcClientFn$<Request, Response> = (req: Observable<Request>) => Observable<Response>;
type UnPromise<T> = T extends Promise<infer U> ? U : T;
type UnObservable<T> = T extends Observable<infer U> ? U : T;
type UnwrapResponse<T> = UnPromise<UnObservable<T>>;

export interface TypedRpcClient<Routes extends Record<string, TypedRpcClientFn<any, any> | TypedRpcClientFn$<any, any>>>
  extends RpcClient {
  call$<K extends keyof Routes>(
    method: K,
    data: Parameters<Routes[K]>[0] | UnObservable<Parameters<Routes[K]>[0]>,
  ): Observable<UnwrapResponse<ReturnType<Routes[K]>>>;
  call<K extends keyof Routes>(
    method: K,
    data: Parameters<Routes[K]>[0],
  ): Promise<UnwrapResponse<ReturnType<Routes[K]>>>;
  notify<K extends keyof Routes>(method: K, data: UnObservable<Parameters<Routes[K]>[0]>): void;
}
