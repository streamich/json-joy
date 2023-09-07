import {firstValueFrom, from, Observable, Subject} from 'rxjs';
import {catchError, finalize, first, map, mergeWith, share, switchMap, take, tap} from 'rxjs/operators';
import {BufferSubject} from '../../../../util/rx/BufferSubject';
import {RpcError, RpcErrorCodes, RpcErrorValue} from './error';
import {Value} from '../../messages/Value';
import {StaticRpcMethod} from '../methods/StaticRpcMethod';
import type {Call} from './types';
import type {RpcMethod} from '../types';
import type {StreamingRpcMethod} from '../methods/StreamingRpcMethod';

export interface RpcApiCallerOptions<Ctx = unknown> {
  getMethod: (name: string) => undefined | StaticRpcMethod<Ctx> | StreamingRpcMethod<Ctx>;

  /**
   * When call `request$` is a multi-value observable and request data is coming
   * in while pre-call check is still being executed, this property determines
   * how many `request$` values to buffer in memory before raising an error
   * and stopping the streaming call. Defaults to 10.
   */
  preCallBufferSize?: number;

  wrapInternalError?: (error: unknown) => unknown;
}

const INVALID_REQUEST_ERROR_VALUE = RpcError.value(RpcError.invalidRequest());

const defaultWrapInternalError = (error: unknown) => RpcError.valueFrom(error);

/**
 * Implements methods to call Reactive-RPC methods on the server.
 */
export class RpcCaller<Ctx = unknown> {
  protected readonly getMethod: RpcApiCallerOptions<Ctx>['getMethod'];
  protected readonly preCallBufferSize: number;
  protected readonly wrapInternalError: (error: unknown) => unknown;

  constructor({
    getMethod,
    preCallBufferSize = 10,
    wrapInternalError = defaultWrapInternalError,
  }: RpcApiCallerOptions<Ctx>) {
    this.getMethod = getMethod;
    this.preCallBufferSize = preCallBufferSize;
    this.wrapInternalError = wrapInternalError;
  }

  public exists(name: string): boolean {
    return !!this.getMethod(name);
  }

  public getMethodStrict(name: string): StaticRpcMethod<Ctx> | StreamingRpcMethod<Ctx> {
    const method = this.getMethod(name);
    if (!method) throw RpcError.valueFromCode(RpcErrorCodes.METHOD_NOT_FOUND);
    return method;
  }

  public info(name: string): Pick<RpcMethod, 'pretty' | 'isStreaming'> {
    return this.getMethodStrict(name);
  }

  protected validate(method: StaticRpcMethod<Ctx> | StreamingRpcMethod<Ctx>, request: unknown): void {
    const validate = method.validate;
    if (!validate) return;
    try {
      const errors = validate(request);
      if (errors as any) throw errors;
    } catch (error) {
      throw this.wrapValidationError(error);
    }
  }

  protected wrapValidationError(error: unknown): RpcErrorValue {
    return RpcError.valueFrom(error, INVALID_REQUEST_ERROR_VALUE);
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
  public async call(name: string, request: unknown, ctx: Ctx): Promise<Value<unknown>> {
    try {
      const method = this.getMethodStrict(name);
      this.validate(method, request);
      const preCall = method.onPreCall;
      if (preCall) await preCall(ctx, request);
      const data = await method.call(request, ctx);
      return new Value(data, method.res);
    } catch (error) {
      throw this.wrapInternalError(error);
    }
  }

  public async notification(name: string, request: unknown, ctx: Ctx): Promise<void> {
    const method = this.getMethodStrict(name);
    if (!(method instanceof StaticRpcMethod)) return;
    if (!method.acceptsNotifications) return;
    this.validate(method, request);
    try {
      if (method.onPreCall) await method.onPreCall(ctx, request);
      await method.call(request, ctx);
    } catch (error) {
      throw this.wrapInternalError(error);
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
  public createCall(name: string, ctx: Ctx): Call {
    const req$ = new Subject<unknown>();
    const reqUnsubscribe$ = new Subject<null>();
    try {
      // This throws when Reactive-RPC method does not exist.
      const method = this.getMethodStrict(name);

      // When Reactive-RPC method is "static".
      if (!method.isStreaming) {
        const response$: Observable<Value> = from(
          (async () => {
            const request = await firstValueFrom(req$.pipe(first()));
            return await this.call(name, request, ctx);
          })(),
        );
        const res$ = new Subject<Value>();
        response$.subscribe(res$);

        // Format errors using custom error formatter.
        const $resWithErrorsFormatted = res$.pipe(
          catchError((error) => {
            throw this.wrapInternalError(error);
          }),
        );

        return {req$, reqUnsubscribe$, res$: $resWithErrorsFormatted};
      }

      // Here we are sure the call will be streaming.
      const methodStreaming = method;

      // Validate all incoming stream requests.
      const requestValidated$ = req$.pipe(
        tap((request) => {
          this.validate(methodStreaming, request);
        }),
      );

      // Buffer incoming requests while pre-call checks are executed.
      const bufferSize = methodStreaming.preCallBufferSize || this.preCallBufferSize;
      const requestBuffered$ = new BufferSubject<unknown>(bufferSize);
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
      const methodResponseType = method.res;
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
          return method.call$(requestBuffered$, ctx).pipe(
            map((response) => new Value(response, methodResponseType)),
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

      // Format errors using custom error formatter.
      const $resWithErrorsFormatted = result$.pipe(
        finalize(() => {
          error$.complete();
        }),
        catchError((error) => {
          throw RpcError.valueFrom(error);
        }),
      );

      return {req$, reqUnsubscribe$, res$: $resWithErrorsFormatted};
    } catch (error) {
      const errorFormatted = RpcError.valueFrom(error);
      req$.error(errorFormatted);
      const res$ = new Subject<Value>();
      res$.error(errorFormatted);
      return {req$, reqUnsubscribe$, res$};
    }
  }

  public call$(name: string, request$: Observable<unknown>, ctx: Ctx): Observable<Value> {
    const call = this.createCall(name, ctx);
    request$.subscribe(call.req$);
    return call.res$;
  }
}
