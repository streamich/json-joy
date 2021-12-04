import {firstValueFrom, from, Observable, Observer, of, Subject} from 'rxjs';
import {catchError, finalize, first, map, mergeWith, share, switchMap, take, tap} from 'rxjs/operators';
import type {IRpcApiCaller, RpcMethod, RpcMethodRequest, RpcMethodResponse, RpcMethodWrapFromRpcMethod} from './types';
import {RpcServerError} from './constants';
import {BufferSubject} from '../../../util/BufferSubject';
import {ErrorFormatter, ErrorLikeErrorFormatter, RpcError} from './error';
import {RpcMethodStreamingWrap, wrapMethod} from './methods';
import type {JsonTypeSystem} from '../../../json-type-system/JsonTypeSystem';
import type {json_string} from '../../../json-brand';
import type {MsgPack} from '../../../json-pack';

export interface RpcApiCallerParams<Api extends Record<string, RpcMethod<Ctx, any, any>>, Ctx = unknown, E = unknown> {
  api: Api;
  types?: JsonTypeSystem<any>;
  error?: ErrorFormatter<E>;

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
 * Represents an in-flight call.
 */
export interface Call<Request = unknown, Response = unknown> {
  req$: Observer<Request>;
  reqUnsubscribe$: Observable<null>;
  res$: Observable<Response>;
}

/**
 * Implements methods to call Reactive-RPC methods on the server.
 */
export class RpcApiCaller<Api extends Record<string, RpcMethod<Ctx, any, any>>, Ctx = unknown, E = unknown>
  implements IRpcApiCaller<Api, Ctx>
{
  public readonly api;
  public readonly error: ErrorFormatter<E>;
  protected readonly preCallBufferSize: number;
  protected readonly maxActiveCalls: number;

  protected _calls: number = 0;

  constructor({types, api, error, preCallBufferSize = 10, maxActiveCalls = 50}: RpcApiCallerParams<Api, Ctx, E>) {
    this.api = {} as any;
    for (const key in api) this.api[key] = wrapMethod(api[key], types);
    this.error = error || (new ErrorLikeErrorFormatter() as any);
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
  public get<K extends keyof Api>(name: K): RpcMethodWrapFromRpcMethod<Api[K]> {
    if (!this.exists(name)) throw new RpcError(RpcServerError.NoMethodSpecified);
    return this.api[name]!;
  }

  /**
   * "call" executes degenerate version of RPC where both request and response data
   * are simple single value.
   *
   * It is a separate implementation from "call$" for performance and complexity
   * reasons.
   *
   * @param name Method name.
   * @param request Request data.
   * @param ctx Server context object.
   * @returns Response data.
   */
  public async call<K extends keyof Api>(
    name: K,
    request: RpcMethodRequest<Api[K]>,
    ctx: Ctx,
  ): Promise<RpcMethodResponse<Api[K]>> {
    try {
      if (this._calls >= this.maxActiveCalls) throw new RpcError(RpcServerError.TooManyActiveCalls);
      const method = this.get(name);
      if (method.validate) method.validate(request);
      try {
        this._calls++;
        if (method.onPreCall) await method.onPreCall(ctx, request);
        return await method.call(ctx, request);
      } finally {
        this._calls--;
      }
    } catch (error) {
      throw this.error.format(error);
    }
  }

  public async callJson<K extends keyof Api>(
    name: K,
    request: RpcMethodRequest<Api[K]>,
    ctx: Ctx,
  ): Promise<json_string<RpcMethodResponse<Api[K]>>> {
    try {
      if (this._calls >= this.maxActiveCalls) throw new RpcError(RpcServerError.TooManyActiveCalls);
      const method = this.get(name);
      if (method.validate) method.validate(request);
      try {
        this._calls++;
        if (method.onPreCall) await method.onPreCall(ctx, request);
        return await method.callJson(ctx, request);
      } finally {
        this._calls--;
      }
    } catch (error) {
      throw this.error.format(error);
    }
  }

  public async callMsgPack<K extends keyof Api>(
    name: K,
    request: RpcMethodRequest<Api[K]>,
    ctx: Ctx,
  ): Promise<MsgPack<RpcMethodResponse<Api[K]>>> {
    try {
      if (this._calls >= this.maxActiveCalls) throw new RpcError(RpcServerError.TooManyActiveCalls);
      const method = this.get(name);
      if (method.validate) method.validate(request);
      try {
        this._calls++;
        if (method.onPreCall) await method.onPreCall(ctx, request);
        return await method.callMsgPack(ctx, request);
      } finally {
        this._calls--;
      }
    } catch (error) {
      throw this.error.format(error);
    }
  }

  /**
   * A call may error in a number of ways:
   *
   * - [x] Request stream itself emits an error.
   * - [x] Any of the request stream values fails validation.
   * - [x] Pre-call checks fail.
   * - [x] Pre-call request buffer is overflown.
   * - [x] Due to inactivity timeout.
   */
  public createCall<R, K extends keyof Api>(
    name: K,
    ctx: Ctx,
    callMethod: (name: K, request: RpcMethodRequest<Api[K]>, ctx: Ctx) => Promise<R>,
    callMethod$: (
      method: RpcMethodWrapFromRpcMethod<Api[K]>,
      ctx: Ctx,
      req$: Observable<RpcMethodRequest<Api[K]>>,
    ) => Observable<R>,
  ): Call<RpcMethodRequest<Api[K]>, R> {
    const req$ = new Subject<RpcMethodRequest<Api[K]>>();
    const reqUnsubscribe$ = new Subject<null>();
    try {
      // When there are too many in-flight calls.
      if (this._calls >= this.maxActiveCalls) throw new RpcError(RpcServerError.TooManyActiveCalls);

      // This throws when Reactive-RPC method does not exist.
      const method = this.get(name);

      // When Reactive-RPC method is "static".
      if (!method.isStreaming) {
        const response$: Observable<R> = from(
          (async () => {
            const request = await firstValueFrom(req$.pipe(first()));
            const response = await callMethod(name, request, ctx);
            return response;
          })(),
        );
        const res$ = new Subject<R>();
        response$.subscribe(res$);

        // Format errors using custom error formatter.
        const $resWithErrorsFormatted = res$.pipe(
          catchError((error) => {
            throw this.error.format(error);
          }),
        );

        return {req$, reqUnsubscribe$, res$: $resWithErrorsFormatted};
      }

      // Here we are sure the call will be streaming.
      const methodStreaming = method as RpcMethodStreamingWrap<
        Ctx,
        RpcMethodRequest<Api[K]>,
        RpcMethodResponse<Api[K]>
      >;

      // Validate all incoming stream requests.
      const requestValidated$ = req$.pipe(
        map((request) => {
          if (methodStreaming.validate) methodStreaming.validate(request);
          return request;
        }),
      );

      // Buffer incoming requests while pre-call checks are executed.
      const bufferSize = methodStreaming.preCallBufferSize || this.preCallBufferSize;
      const requestBuffered$ = new BufferSubject<RpcMethodRequest<Api[K]>>(bufferSize);
      // requestBuffered$.subscribe({error: () => {}});

      // Error signal (only emits errors), merged with response stream.
      // Used for pre-call buffer overflow and timeout errors.
      const error$ = new Subject<never>();

      // Keep track of buffering errors, such as buffer overflow.
      requestBuffered$.subscribe({
        error: (error) => {
          error$.error(error);
        },
        // complete: () => { error$.complete(); },
      });
      requestValidated$.subscribe(requestBuffered$);

      // Main call execution.
      const result$ = requestBuffered$.pipe(
        // First, execute pre-call checks with only the first request.
        take(1),
        switchMap((request) => {
          return methodStreaming.onPreCall ? from(methodStreaming.onPreCall(ctx, request)) : from([0]);
        }),
        // Execute the actual RPC call and flush request buffer.
        switchMap(() => {
          Promise.resolve().then(() => {
            requestBuffered$.flush();
          });
          return callMethod$(methodStreaming as RpcMethodWrapFromRpcMethod<Api[K]>, ctx, requestBuffered$).pipe(
            finalize(() => {
              error$.complete();
            }),
          );
        }),
        // Make sure we don't call method implementation more than once.
        share(),
        // Make sure external errors are captured.
        mergeWith(error$),
      );

      // Track number of in-flight calls.
      const resultWithActiveCallTracking$ = of(null).pipe(
        tap(() => {
          this._calls++;
        }),
        switchMap(() => result$),
        finalize(() => {
          error$.complete();
          this._calls--;
        }),
      );

      // Format errors using custom error formatter.
      const $resWithErrorsFormatted = resultWithActiveCallTracking$.pipe(
        catchError((error) => {
          throw this.error.format(error);
        }),
      );

      return {req$, reqUnsubscribe$, res$: $resWithErrorsFormatted};
    } catch (error) {
      const errorFormatted = this.error.format(error);
      req$.error(errorFormatted);
      const res$ = new Subject<RpcMethodResponse<Api[K]>>();
      res$.error(errorFormatted);
      return {req$, reqUnsubscribe$, res$};
    }
  }

  public call$<K extends keyof Api>(
    name: K,
    request$: Observable<RpcMethodRequest<Api[K]>>,
    ctx: Ctx,
  ): Observable<RpcMethodResponse<Api[K]>> {
    const call = this.createCall(
      name,
      ctx,
      (name, req, ctx) => this.call(name, req, ctx),
      (method, ctx, req$) => method.call$(ctx, req$),
    );
    request$.subscribe(call.req$);
    return call.res$;
  }

  public callJson$<K extends keyof Api>(
    name: K,
    request$: Observable<RpcMethodRequest<Api[K]>>,
    ctx: Ctx,
  ): Observable<json_string<RpcMethodResponse<Api[K]>>> {
    const call = this.createCall(
      name,
      ctx,
      (name, req, ctx) => this.callJson(name, req, ctx),
      (method, ctx, req$) => method.callJson$(ctx, req$),
    );
    request$.subscribe(call.req$);
    return call.res$;
  }

  public callMsgPack$<K extends keyof Api>(
    name: K,
    request$: Observable<RpcMethodRequest<Api[K]>>,
    ctx: Ctx,
  ): Observable<MsgPack<RpcMethodResponse<Api[K]>>> {
    const call = this.createCall(
      name,
      ctx,
      (name, req, ctx) => this.callMsgPack(name, req, ctx),
      (method, ctx, req$) => method.callMsgPack$(ctx, req$),
    );
    request$.subscribe(call.req$);
    return call.res$;
  }
}
