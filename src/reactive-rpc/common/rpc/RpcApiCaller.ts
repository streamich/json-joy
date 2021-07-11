import {RpcServerError} from './constants';
import {firstValueFrom, from, Observable, of, throwError} from 'rxjs';
import {map, switchMap, take, tap} from 'rxjs/operators';
import {BufferSubject} from '../../../util/BufferSubject';
import {IRpcApiCaller, RpcMethod, RpcMethodRequest, RpcMethodResponse} from './types';

export interface RpcApiCallerParams<Api extends Record<string, RpcMethod<Ctx, any, any>>, Ctx = unknown, E = unknown> {
  api: Api;

  /**
   * Method to format any error thrown by application to correct format.
   */
  formatError: (error: E | Error | unknown) => E;

  /**
   * Method to format validation error thrown by .validate() function of a
   * method. If this property not provided, defaults to `.formatError`.
   */
  formatValidationError?: (error: E | Error | unknown) => E;

  /**
   * Method to format error into the correct format.
   */
  formatErrorCode?: (code: RpcServerError) => E;

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
  protected readonly formatError: (error: E | Error | unknown) => E;
  protected readonly formatValidationError: (error: E | Error | unknown) => E;
  protected readonly formatErrorCode: (code: RpcServerError) => E;
  protected readonly preCallBufferSize: number;

  constructor({
    api,
    formatErrorCode,
    formatError,
    formatValidationError,
    preCallBufferSize = 10,
  }: RpcApiCallerParams<Api, Ctx, E>) {
    this.api = api;
    this.formatError = formatError;
    this.formatValidationError = formatValidationError || formatError;
    this.formatErrorCode = formatErrorCode || formatError;
    this.preCallBufferSize = preCallBufferSize;
  }

  public async call<K extends keyof Api>(name: K, request: RpcMethodRequest<Api[K]>, ctx: Ctx): Promise<RpcMethodResponse<Api[K]>> {
    if (!this.api.hasOwnProperty(name))
      throw this.formatErrorCode(RpcServerError.NoMethodSpecified);
    const method = this.api[name];
    if (method.validate) {
      try {
        method.validate(request);
      } catch (error) {
        throw this.formatValidationError(error);
      }
    }
    return (method.onPreCall ? method.onPreCall(ctx, request) : Promise.resolve())
      .then(() => !method.isStreaming
        ? method.call(ctx, request)
        : firstValueFrom(method.call$(ctx, of(request)))
      )
      .catch(error => {
        throw this.formatError(error);
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
      return throwError(() => this.formatErrorCode(RpcServerError.NoMethodSpecified));
    const method = this.api[name]!;
    if (!method.isStreaming) {
      return request$.pipe(
        take(1),
        switchMap(request => from(this.call(name, request, ctx))),
      );
    }
    if (method.validate) {
      request$ = request$.pipe(map(request => {
        method.validate!(request);
        return request;
      }));
    }
    const requestBuffer$ = new BufferSubject<RpcMethodRequest<Api[K]>>(method.preCallBufferSize || this.preCallBufferSize);
    return requestBuffer$
      .pipe(
        take(1),
        switchMap(request => method.onPreCall ? from(method.onPreCall(ctx, request)) : from([0])),
        switchMap(() => method.call$(ctx, requestBuffer$)),
        tap(() => {
          requestBuffer$.flush();
        }),
      );
  }
}
