import {firstValueFrom, from, Observable, of, Subject, throwError} from 'rxjs';
import {finalize, map, mergeWith, switchMap, take, tap} from 'rxjs/operators';
import type {IRpcApiCaller, RpcMethod, RpcMethodRequest, RpcMethodResponse, RpcMethodStreaming} from './types';
import {RpcServerError} from './constants';
import {BufferSubject} from '../../../util/BufferSubject';
import {RpcError, RpcValidationError} from './error';

export interface RpcApiCallerParams<Api extends Record<string, RpcMethod<Ctx, any, any>>, Ctx = unknown, E = unknown> {
  api: Api;

  /**
   * When call `request$` is a multi-value observable and request data is coming
   * in while pre-call check is still being executed, this property determines
   * how many `request$` values to buffer in memory before raising an error
   * and stopping the streaming call. Defaults to 10.
   */
  preCallBufferSize?: number;

  /**
   * Maximum number of active subscription in flight. This also includes
   * in-flight request/response subscriptions.
   */
  maxActiveCalls?: number;
}

/**
 * Implements methods to call Reactive-RPC methods on the server.
 */
export class RpcApiCaller<Api extends Record<string, RpcMethod<Ctx, any, any>>, Ctx = unknown, E = unknown> implements IRpcApiCaller<Api, Ctx> {
  public readonly api: Api;
  protected readonly preCallBufferSize: number;
  protected readonly maxActiveCalls: number;

  protected _calls: number = 0;

  constructor({
    api,
    preCallBufferSize = 10,
    maxActiveCalls = 50,
  }: RpcApiCallerParams<Api, Ctx, E>) {
    this.api = api;
    this.preCallBufferSize = preCallBufferSize;
    this.maxActiveCalls = maxActiveCalls;
  }

  public get activeCalls(): number {
    return this._calls;
  }

  public exists<K extends keyof Api>(name: K): boolean {
    return this.api.hasOwnProperty(name);
  }

  /**
   * Do not use this method to execute the RPC methods directly. To execute the
   * RPC methods use `.call()` or `.call$()` instead. You can use this method to
   * check if an RPC method exists and to check if the RPC method is a
   * "streaming" method or not.
   *
   * This function throws `RpcServerError.NoMethodSpecified` error if the RPC
   * method is not found.
   *
   * @param name Name of the RPC method.
   * @returns RpcMethod
   */
  public get<K extends keyof Api>(name: K): Api[K] {
    if (!this.exists(name))
      throw new RpcError(RpcServerError.NoMethodSpecified);
    return this.api[name]!;
  }

  public async call<K extends keyof Api>(name: K, request: RpcMethodRequest<Api[K]>, ctx: Ctx): Promise<RpcMethodResponse<Api[K]>> {
    if (this._calls >= this.maxActiveCalls)
      throw new RpcError(RpcServerError.TooManyActiveCalls);
    const method = this.get(name);
    if (method.validate) {
      try {
        method.validate(request);
      } catch (error) {
        throw new RpcValidationError(error);
      }
    }
    this._calls++;
    return (method.onPreCall ? method.onPreCall(ctx, request) : Promise.resolve())
      .then(() => !method.isStreaming
        ? (method as any).call(ctx, request)
        : firstValueFrom((method as any).call$(ctx, of(request)))
      )
      .finally(() => {
        this._calls--;
      });
  }

  /**
   * The `request$` observable may error in a number of ways:
   *
   * 1. `request$` itself can emit error.
   * 2. Any of emitted values can fail validation.
   * 3. Pre-call check may fail.
   * 4. Too many values may accumulate in `request$` buffer during pre-call check.
   * 5. Due to inactivity timeout.
   */
  public call$<K extends keyof Api>(name: K, request$: Observable<RpcMethodRequest<Api[K]>>, ctx: Ctx): Observable<RpcMethodResponse<Api[K]>> {
    if (this._calls >= this.maxActiveCalls)
      return throwError(() => new RpcError(RpcServerError.TooManyActiveCalls));
    const method = this.get(name);
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
          throw new RpcValidationError(error);
        }
        return request;
      }));
    }
    const bufferSize = methodStreaming.preCallBufferSize || this.preCallBufferSize;
    const requestBuffer$ = new BufferSubject<RpcMethodRequest<Api[K]>>(bufferSize);
    requestBuffer$.subscribe({error: () => {}});
    const requestBufferError$ = new Subject<never>();
    requestBuffer$.subscribe({
      error: error => {
        requestBufferError$.error(error);
      },
      complete: () => {
        requestBufferError$.complete();
      },
    });
    request$.subscribe(requestBuffer$);

    const result$ = requestBuffer$
      .pipe(
        take(1),
        switchMap(request => {
          return methodStreaming.onPreCall
            ? from(methodStreaming.onPreCall(ctx, request))
            : from([0]);
        }),
        switchMap(() => {
          Promise.resolve().then(() => {
            requestBuffer$.flush();
          });
          return methodStreaming.call$(ctx, requestBuffer$)
            .pipe(
              finalize(() => {
                requestBufferError$.complete();
              }),
            );
        }),
        mergeWith(requestBufferError$),
      );

    this._calls++;
    const resultWithActiveCallTracking$ = result$.pipe(
      finalize(() => {
        requestBufferError$.complete();
        this._calls--;
      }),
    );

    return resultWithActiveCallTracking$;
  }
}
