import type {IRpcApiCaller, RpcMethod, RpcMethodRequest, RpcMethodResponse, RpcMethodStreaming} from './types';
import {RpcServerError} from './constants';
import {firstValueFrom, from, Observable, of, throwError} from 'rxjs';
import {catchError, map, switchMap, take, tap} from 'rxjs/operators';
import {BufferSubject} from '../../../util/BufferSubject';
import {ErrorFormatter, ErrorLikeErrorFormatter} from './error';

export interface RpcApiCallerParams<Api extends Record<string, RpcMethod<Ctx, any, any>>, Ctx = unknown, E = unknown> {
  api: Api;
  error?: ErrorFormatter<E>;

  /**
   * When call `request$` is a multi-value observable and request data is coming
   * in while pre-call check is still being executed, this property determines
   * how many `request$` values to buffer in memory before raising an error
   * and stopping the streaming call. Defaults to 10.
   */
  preCallBufferSize?: number;
}

/**
 * Implements methods to call Reactive-RPC methods on the server.
 */
export class RpcApiCaller<Api extends Record<string, RpcMethod<Ctx, any, any>>, Ctx = unknown, E = unknown> implements IRpcApiCaller<Api, Ctx> {
  public readonly api: Api;
  protected readonly error: ErrorFormatter<E>;
  protected readonly preCallBufferSize: number;

  constructor({
    api,
    error,
    preCallBufferSize = 10,
  }: RpcApiCallerParams<Api, Ctx, E>) {
    this.api = api;
    this.error = error || new ErrorLikeErrorFormatter() as any;
    this.preCallBufferSize = preCallBufferSize;
  }

  public async call<K extends keyof Api>(name: K, request: RpcMethodRequest<Api[K]>, ctx: Ctx): Promise<RpcMethodResponse<Api[K]>> {
    if (!this.api.hasOwnProperty(name))
      throw this.error.formatCode(RpcServerError.NoMethodSpecified);
    const method = this.api[name];
    if (method.validate) {
      try {
        method.validate(request);
      } catch (error) {
        throw this.error.formatValidation(error);
      }
    }
    return (method.onPreCall ? method.onPreCall(ctx, request) : Promise.resolve())
      .then(() => !method.isStreaming
        ? (method as any).call(ctx, request)
        : firstValueFrom((method as any).call$(ctx, of(request)))
      )
      .catch(error => {
        throw this.error.format(error);
      });
  }

  /**
   * The `request$` observable may error in a number of ways:
   *
   * 1. `request$` itself can emit error.
   * 2. Any of emitted values can fail validation.
   * 3. Pre-call check may fail.
   * 4. Too many values may accumulate in `request$` buffer during pre-call check.
   */
  public call$<K extends keyof Api>(name: K, request$: Observable<RpcMethodRequest<Api[K]>>, ctx: Ctx): Observable<RpcMethodResponse<Api[K]>> {
    if (!this.api.hasOwnProperty(name))
      return throwError(() => this.error.formatCode(RpcServerError.NoMethodSpecified));
    const method = this.api[name]!;
    if (!method.isStreaming) {
      return request$.pipe(
        take(1),
        switchMap(request => from(this.call(name, request, ctx))),
      );
    }
    const methodStreaming = method as RpcMethodStreaming<Ctx, RpcMethodRequest<Api[K]>, RpcMethodResponse<Api[K]>>;
    if (methodStreaming.validate) {
      request$ = request$.pipe(map(request => {
        try {
          methodStreaming.validate!(request);
        } catch (error) {
          throw this.error.formatValidation(error);
        }
        return request;
      }));
    }
    const requestBuffer$ = new BufferSubject<RpcMethodRequest<Api[K]>>(methodStreaming.preCallBufferSize || this.preCallBufferSize);
    request$.subscribe(requestBuffer$);
    return requestBuffer$
      .pipe(
        take(1),
        switchMap(request => methodStreaming.onPreCall ? from(methodStreaming.onPreCall(ctx, request)) : from([0])),
        switchMap(() => methodStreaming.call$(ctx, requestBuffer$)),
        tap(() => {
          requestBuffer$.flush();
        }),
        // TODO: add tests for streaming error formatting
        catchError(error => {
          throw this.error.format(error);
        }),
      );
  }
}
