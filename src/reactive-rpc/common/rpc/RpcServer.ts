import {EMPTY, from, Observable, Subject} from 'rxjs';
import {catchError, switchMap, take} from 'rxjs/operators';
import {BufferSubject} from '../../../util/BufferSubject';
import {ReactiveRpcRequestMessage, ReactiveRpcResponseMessage, NotificationMessage, RequestCompleteMessage, RequestDataMessage, RequestErrorMessage, RequestUnsubscribeMessage, ResponseCompleteMessage, ResponseDataMessage, ResponseErrorMessage, ResponseUnsubscribeMessage} from '../messages/nominal';
import {subscribeCompleteObserver} from '../util/subscribeCompleteObserver';
import {TimedQueue} from '../util/TimedQueue';
import {RpcApi, RpcMethod, RpcMethodStatic, RpcMethodStreaming} from './types';

export const enum RpcServerError {
  Unknown = 0,
  IdTaken = 1,
  TooManyActiveCalls = 2,
  InvalidData = 3,
  NoMethodSpecified = 4,
  MethodNotFound = 5,
  ErrorForStaticMethod = 6,
  Stop = 7,
  Disconnect = 8,
}

export interface RpcServerParams<Ctx = unknown, T = unknown> {
  /**
   * Method to be called by server when it wants to send messages to the client.
   * This is usually your WebSocket "send" method.
   */
  send: (messages: ReactiveRpcResponseMessage[]) => void;

  /**
   * Callback called on the server when user sends a subscription message.
   */
  onCall: (name: string) => RpcMethod<Ctx, T, T> | undefined;

  /**
   * Method which is executed before an actual call to an RPC method. Pre-call
   * checks should execute all necessary checks (such as authentication,
   * authorization, throttling, etc.) before allowing the real method to
   * proceed. Pre-call checks should throw, if for any reason the call should
   * not proceed. Return void to allow execution of the actual call.
   *
   * @param name Name of the API method.
   * @param ctx Request context object.
   * @param request Request payload, the first emitted value in case of
   *                streaming request.
   */
  onPreCall?: (name: string, ctx: Ctx, request: T) => Promise<void>;

  /**
   * Callback called on the server when user sends a notification message.
   */
  onNotification: (name: string, data: T | undefined, ctx: Ctx) => void;

  /**
   * Method to format any error thrown by application to correct format.
   */
  formatError: (error: T | Error | unknown) => T;

  /**
   * Method to format error into the correct format.
   */
  formatErrorCode?: (code: RpcServerError) => T;

  /**
   * Maximum number of active subscription in flight. This also includes
   * in-flight request/response subscriptions.
   */
  maxActiveCalls?: number;

  /**
   * Number of messages to keep in buffer before sending them out.
   * The buffer is flushed when the message reaches this limit or when the
   * buffering time has reached the time specified in `bufferTime` parameter.
   * Defaults to 10 messages.
   */
  bufferSize?: number;

  /**
   * Time in milliseconds for how long to buffer messages before sending them
   * out. Defaults to 1 milliseconds. Set it to zero to disable buffering.
   */
  bufferTime?: number;

  /**
   * When call `request$` is a multi-value observable and request data is coming
   * in while pre-call check is still being executed, this property determines
   * how many `request$` values to buffer in memory before raising an error
   * and stopping the streaming call. Defaults to 10.
   */
  preCallBufferSize?: number;
}

export interface RpcServerFromApiParams<Ctx = unknown, T = unknown> extends Omit<RpcServerParams<Ctx, T>, 'onCall'> {
  api: RpcApi<Ctx, T>;
}

class StreamCall<T = unknown> {
  public reqFinalized: boolean = false;
  public resFinalized: boolean = false;
  public readonly req$: BufferSubject<T>;
  public readonly res$: Subject<T> = new Subject();

  constructor (preCallBufferSize: number) {
    this.req$ = new BufferSubject(preCallBufferSize);
  }
}

export class RpcServer<Ctx = unknown, T = unknown> {
  public static fromApi<Ctx = unknown, T = unknown>(params: RpcServerFromApiParams<Ctx, T>): RpcServer<Ctx, T> {
    const {api, ...rest} = params;
    const server = new RpcServer({
      ...rest,
      onCall: (method: string) => {
        if (!api.hasOwnProperty(method)) return undefined;
        return api[method];
      },
    });
    return server;
  }

  private activeStaticCalls: number = 0;
  private send: (message: ReactiveRpcResponseMessage<T>) => void;
  private getRpcMethod: RpcServerParams<Ctx, T>['onCall'];
  private onPreCall: RpcServerParams<Ctx, T>['onPreCall'];
  private notify: RpcServerParams<Ctx, T>['onNotification'];
  private readonly formatError: (error: T | Error | unknown) => T;
  private readonly formatErrorCode: (code: RpcServerError) => T;
  private readonly activeStreamCalls: Map<number, StreamCall<T>> = new Map();
  private readonly maxActiveCalls: number;
  private readonly preCallBufferSize: number;

  constructor({
    send,
    onCall: call,
    onPreCall,
    onNotification: notify,
    formatErrorCode,
    formatError,
    maxActiveCalls = 30,
    bufferSize = 10,
    bufferTime = 1,
    preCallBufferSize = 10,
  }: RpcServerParams<Ctx, T>) {
    this.getRpcMethod = call;
    this.onPreCall = onPreCall;
    this.notify = notify;
    this.formatError = formatError;
    this.formatErrorCode = formatErrorCode || formatError;
    this.maxActiveCalls = maxActiveCalls;
    this.preCallBufferSize = preCallBufferSize;
    if (bufferTime) {
      const buffer = new TimedQueue<ReactiveRpcResponseMessage>();
      buffer.itemLimit = bufferSize;
      buffer.timeLimit = bufferTime;
      buffer.onFlush = send;
      this.send = (message) => {
        buffer.push(message);
      };
    } else {
      this.send = message => send([message]);
    }
  }

  /**
   * Returns the number of active in-flight calls. Useful for reporting and
   * testing for memory leaks in unit tests.
   *
   * @returns Number of in-flight RPC calls.
   */
   public getInflightCallCount(): number {
    return this.activeStaticCalls + this.activeStreamCalls.size;
  }

  public onMessage(message: ReactiveRpcRequestMessage<T>, ctx: Ctx): void {
    if (message instanceof RequestDataMessage) this.onRequestData(message, ctx);
    else if (message instanceof RequestCompleteMessage) this.onRequestComplete(message, ctx);
    else if (message instanceof RequestErrorMessage) this.onRequestError(message, ctx);
    else if (message instanceof NotificationMessage) this.onNotification(message, ctx);
    else if (message instanceof ResponseUnsubscribeMessage) this.onUnsubscribe(message);
  }

  public onMessages(messages: ReactiveRpcRequestMessage<T>[], ctx: Ctx): void {
    const length = messages.length;
    for (let i = 0; i < length; i++) this.onMessage(messages[i], ctx);
  }

  public stop(reason: RpcServerError = RpcServerError.Stop) {
    this.send = (message: ReactiveRpcResponseMessage<T>) => {};
    this.notify = (name: string, data: T | undefined, ctx: Ctx) => {};
    for (const call of this.activeStreamCalls.values()) {
      call.req$.error(this.formatErrorCode(reason));
      call.res$.error(this.formatErrorCode(reason));
    }
    this.activeStreamCalls.clear();
  }

  public disconnect() {
    this.stop(RpcServerError.Disconnect);
  }

  private sendError(id: number, code: RpcServerError): void {
    const data = this.formatErrorCode(code);
    const message = new ResponseErrorMessage<T>(id, data);
    this.send(message);
  }

  private execStaticCall(id: number, name: string, method: RpcMethodStatic<Ctx, T, T>, request: T, ctx: Ctx) {
    if (this.getInflightCallCount() >= this.maxActiveCalls) {
      this.sendError(id, RpcServerError.TooManyActiveCalls);
      return;
    }
    if (method.validate) {
      try {
        method.validate(request);
      } catch (error) {
        const formattedError = this.formatError(error);
        this.send(new ResponseErrorMessage<T>(id, formattedError));
        return;
      }
    }
    this.activeStaticCalls++;
    (this.onPreCall ? this.onPreCall(name, ctx, request) : Promise.resolve())
      .then(() => method.call(ctx, request))
      .then(response => {
        this.activeStaticCalls--;
        this.send(new ResponseCompleteMessage<T>(id, response));
      })
      .catch(error => {
        this.activeStaticCalls--;
        const formattedError = this.formatError(error);
        this.send(new ResponseErrorMessage<T>(id, formattedError));
      });
  }

  private createStreamCall(id: number, name: string, rpcMethodStreaming: RpcMethodStreaming<Ctx, T, T>, ctx: Ctx): StreamCall<T> | undefined {
    if (this.getInflightCallCount() >= this.maxActiveCalls) {
      this.sendError(id, RpcServerError.TooManyActiveCalls);
      return;
    }
    const streamCall = new StreamCall<T>(rpcMethodStreaming.preCallBufferSize || this.preCallBufferSize);
    this.activeStreamCalls.set(id, streamCall);
    streamCall.req$.subscribe({
      error: error => {
        if (error instanceof Error && error.message === 'BufferSubjectOverflow') {
          streamCall.res$.error(error);
        }
      },
    });
    const requestThatTracksUnsubscribe$ = new Observable<T>((observer) => {
      streamCall.req$.subscribe(observer);
      return () => {
        if (!streamCall.reqFinalized)
          this.send(new RequestUnsubscribeMessage(id));
        streamCall.req$.complete();
      };
    });
    const onReqFinalize = () => {
      if (streamCall.resFinalized) {
        this.activeStreamCalls.delete(id);
      }
      else streamCall.reqFinalized = true;
    };
    streamCall.req$.subscribe({error: onReqFinalize, complete: onReqFinalize});
    subscribeCompleteObserver<T>(streamCall.res$, {
      next: (value: T) => {
        this.send(new ResponseDataMessage<T>(id, value));
      },
      error: (error: unknown) => {
        if (!streamCall.resFinalized) this.send(new ResponseErrorMessage<T>(id, this.formatError(error)));
        if (streamCall.reqFinalized) {
          this.activeStreamCalls.delete(id);
        } else {
          streamCall.resFinalized = true;
        }
      },
      complete: (value: T | undefined) => {
        if (!streamCall.resFinalized) this.send(new ResponseCompleteMessage<T>(id, value));
        if (streamCall.reqFinalized) {
          this.activeStreamCalls.delete(id);
        } else {
          streamCall.resFinalized = true;
        }
      },
    });
    streamCall.req$
      .pipe(
        take(1),
        catchError(() => {
          return EMPTY;
        }),
        switchMap(request => this.onPreCall ? from(this.onPreCall(name, ctx, request)) : from([0])),
      ).subscribe(() => {
        rpcMethodStreaming.call$(ctx, requestThatTracksUnsubscribe$)
          .subscribe(streamCall.res$);
        streamCall.req$.flush();
      });
    return streamCall;
  }

  public onRequestData(message: RequestDataMessage<T>, ctx: Ctx): void {
    const {id, method, data} = message;
    const call = this.activeStreamCalls.get(id);
    if (!method) return this.sendError(id, RpcServerError.NoMethodSpecified);
    const rpcMethod = this.getRpcMethod(method)!;
    if (call) return this.receiveRequestData(rpcMethod, call, data);
    if (!rpcMethod) return this.sendError(id, RpcServerError.MethodNotFound);
    if (!rpcMethod.isStreaming) return this.execStaticCall(id, method, rpcMethod, data as T, ctx);
    const streamCall = this.createStreamCall(id, method, rpcMethod, ctx);
    if (!streamCall) return;
    this.receiveRequestData(rpcMethod, streamCall, data);
  }

  public onRequestComplete(message: RequestCompleteMessage<T>, ctx: Ctx): void {
    const {id, method, data} = message;
    const call = this.activeStreamCalls.get(id);
    if (call) {
      call.reqFinalized = true;
      const {req$} = call;
      if (data !== undefined) req$.next(data as T);
      return req$.complete();
    }
    if (!method) return this.sendError(id, RpcServerError.NoMethodSpecified);
    const rpcMethod = this.getRpcMethod(method);
    if (!rpcMethod) return this.sendError(id, RpcServerError.MethodNotFound);
    if (!rpcMethod.isStreaming) return this.execStaticCall(id, method, rpcMethod, data as T, ctx);
    const streamCall = this.createStreamCall(id, method, rpcMethod, ctx);
    if (!streamCall) return;
    streamCall.reqFinalized = true;
    this.receiveRequestData(rpcMethod, streamCall, data);
    streamCall.req$.complete();
  }

  protected receiveRequestData(method: RpcMethod<Ctx, T, T>, call: StreamCall<T>, data: undefined | T): void {
    if (data === undefined) return;
    if (method.validate) {
      try {
        method.validate(data);
      } catch (error) {
        call.req$.error(error);
        call.res$.error(error);
        return;
      }
    }
    call.req$.next(data);
  }

  public onRequestError(message: RequestErrorMessage, ctx: Ctx): void {
    const {id, method, data} = message;
    const call = this.activeStreamCalls.get(id);
    if (call) {
      call.reqFinalized = true;
      return call.req$.error(data);
    }
    if (!method) return this.sendError(id, RpcServerError.NoMethodSpecified);
    const rpcMethod = this.getRpcMethod(method);
    if (!rpcMethod) return this.sendError(id, RpcServerError.MethodNotFound);
    if (!rpcMethod.isStreaming) return this.sendError(id, RpcServerError.ErrorForStaticMethod);
    const streamCall = this.createStreamCall(id, method, rpcMethod, ctx);
    if (!streamCall) return;
    streamCall.req$.error(data);
  }

  public onUnsubscribe(message: ResponseUnsubscribeMessage): void {
    const {id} = message;
    const call = this.activeStreamCalls.get(id);
    if (!call) return;
    call.resFinalized = true;
    this.activeStreamCalls.delete(id);
    call.res$.complete();
  }

  public onNotification(message: NotificationMessage<T>, ctx: Ctx): void {
    const {method, data} = message;
    this.notify(method, data, ctx);
  }
}
