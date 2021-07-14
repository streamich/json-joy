import type {IRpcApiCaller, RpcMethod, RpcMethodRequest, RpcMethodResponse, RpcMethodStreaming} from './types';
import {RpcServerError} from './constants';
import {firstValueFrom, from, Observable, of, throwError} from 'rxjs';
import {RpcApiCaller} from './RpcApiCaller';

export interface RpcApiCallerWithLimitParams<Api extends Record<string, RpcMethod<Ctx, any, any>>, Ctx = unknown, E = unknown> {
  caller: RpcApiCaller<Api, Ctx, E>;
  maxActiveCalls: number;
}

/**
 * RpcApiCaller wrapper which enforces the maximum number of allow in-flight
 * requests.
 */
export class RpcApiCallerWithLimit<Api extends Record<string, RpcMethod<Ctx, any, any>>, Ctx = unknown, E = unknown> implements IRpcApiCaller<Api, Ctx> {
  public readonly caller: RpcApiCaller<Api, Ctx, E>;
  public readonly maxActiveCalls: number;

  protected activeCalls: number = 0;

  constructor({
    caller,
    maxActiveCalls,
  }: RpcApiCallerWithLimitParams<Api, Ctx, E>) {
    this.caller = caller;
    this.maxActiveCalls = maxActiveCalls;
  }

  public async call<K extends keyof Api>(name: K, request: RpcMethodRequest<Api[K]>, ctx: Ctx): Promise<RpcMethodResponse<Api[K]>> {
    if (this.maxActiveCalls <= this.activeCalls)
      throw new
  }

  public call$<K extends keyof Api>(name: K, request$: Observable<RpcMethodRequest<Api[K]>>, ctx: Ctx): Observable<RpcMethodResponse<Api[K]>> {

  }
}
