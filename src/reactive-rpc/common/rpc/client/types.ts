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
}
