import {Observable, Subject} from 'rxjs';
import {ReactiveRpcRequestMessage, ReactiveRpcResponseMessage, NotificationMessage, RequestCompleteMessage, RequestDataMessage, RequestErrorMessage, RequestUnsubscribeMessage, ResponseCompleteMessage, ResponseDataMessage, ResponseErrorMessage, ResponseUnsubscribeMessage} from '../messages/nominal';
import {subscribeCompleteObserver} from '../util/subscribeCompleteObserver';
import {TimedQueue} from '../util/TimedQueue';
import {IRpcApiCaller, RpcApi, RpcMethod} from './types';
import {RpcServerError} from './constants';
import {ErrorFormatter, ErrorLikeErrorFormatter, RpcError} from './error';

export {RpcServerError};

export interface RpcServerParams<Ctx = unknown, T = unknown> {
  caller: IRpcApiCaller<any, Ctx>;
  error?: ErrorFormatter<T>;

  /**
   * Method to be called by server when it wants to send messages to the client.
   * This is usually your WebSocket "send" method.
   */
  send: (messages: (ReactiveRpcResponseMessage<T> | NotificationMessage<T>)[]) => void;

  /**
   * Callback called on the server when user sends a notification message.
   */
  onNotification: (name: string, data: T | undefined, ctx: Ctx) => void;

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
}

export interface RpcServerFromApiParams<Ctx = unknown, T = unknown> extends Omit<RpcServerParams<Ctx, T>, 'onCall'> {
  api: RpcApi<Ctx, T>;
}

class StreamCall<T = unknown> {
  public reqFinalized: boolean = false;
  public resFinalized: boolean = false;
  public readonly req$: Subject<T> = new Subject();
  public readonly res$: Subject<T> = new Subject();
}

export class RpcServer<Ctx = unknown, T = unknown> {
  private readonly caller: IRpcApiCaller<any, Ctx>;
  public readonly error: ErrorFormatter<T>;

  private readonly activeStreamCalls: Map<number, StreamCall<T>> = new Map();
  private send: (message: ReactiveRpcResponseMessage<T> | NotificationMessage<T>) => void;

  /** Callback which sends message out of the server. */
  public onSend: (messages: (ReactiveRpcResponseMessage<T> | NotificationMessage<T>)[]) => void;

  /** Callback called when server receives a notification. */
  public onNotification: RpcServerParams<Ctx, T>['onNotification'];

  constructor({
    caller,
    error,
    send,
    onNotification: notify,
    bufferSize = 10,
    bufferTime = 1,
  }: RpcServerParams<Ctx, T>) {
    this.caller = caller;
    this.error = error || new ErrorLikeErrorFormatter() as any;
    this.onNotification = notify;
    this.onSend = send;
    if (bufferTime) {
      const buffer = new TimedQueue<ReactiveRpcResponseMessage<T> | NotificationMessage<T>>();
      buffer.itemLimit = bufferSize;
      buffer.timeLimit = bufferTime;
      buffer.onFlush = messages => this.onSend(messages);
      this.send = (message) => {
        buffer.push(message);
      };
    } else {
      this.send = message => {
        this.onSend([message]);
      };
    }
  }

  /**
   * Processes a single incoming Reactive-RPC message.
   *
   * This method will not throw.
   *
   * @param message A single Reactive-RPC message.
   * @param ctx Server context.
   */
  public onMessage(message: ReactiveRpcRequestMessage<T>, ctx: Ctx): void {
    try {
      if (message instanceof RequestDataMessage) this.onRequestDataMessage(message, ctx);
      else if (message instanceof RequestCompleteMessage) this.onRequestCompleteMessage(message, ctx);
      else if (message instanceof RequestErrorMessage) this.onRequestErrorMessage(message, ctx);
      else if (message instanceof NotificationMessage) this.onNotificationMessage(message, ctx);
      else if (message instanceof ResponseUnsubscribeMessage) this.onUnsubscribeMessage(message);
    } catch (error) {
      const formattedError = this.error.format(error);
      const message = new NotificationMessage('.err', formattedError);
      this.send(message);
    }
  }

  /**
   * Receives a list of all incoming messages from the client to process.
   *
   * This method will not throw.
   *
   * @param messages A list of received messages.
   * @param ctx Server context.
   */
  public onMessages(messages: ReactiveRpcRequestMessage<T>[], ctx: Ctx): void {
    // This method should not throw.
    const length = messages.length;
    for (let i = 0; i < length; i++) this.onMessage(messages[i], ctx);
  }

  public stop(reason: RpcServerError = RpcServerError.Stop) {
    this.send = (message: ReactiveRpcResponseMessage<T> | NotificationMessage<T>) => {};
    this.onNotification = (name: string, data: T | undefined, ctx: Ctx) => {};
    for (const call of this.activeStreamCalls.values()) {
      call.req$.error(new RpcError(reason));
      call.res$.error(new RpcError(reason));
    }
    this.activeStreamCalls.clear();
  }

  public disconnect() {
    this.stop(RpcServerError.Disconnect);
  }

  private sendError(id: number, code: RpcServerError): void {
    const data = this.error.formatCode(code);
    const message = new ResponseErrorMessage<T>(id, data);
    this.send(message);
  }

  private execStaticCall(id: number, name: string, request: T, ctx: Ctx) {
    this.caller.call(name, request, ctx)
      .then(response => {
        this.send(new ResponseCompleteMessage<T>(id, response as T));
      })
      .catch(error => {
        const formattedError = this.error.format(error);
        this.send(new ResponseErrorMessage<T>(id, formattedError));
      });
  }

  private createStreamCall(id: number, name: string, ctx: Ctx): StreamCall<T> | undefined {
    const streamCall = new StreamCall<T>();
    this.activeStreamCalls.set(id, streamCall);
    streamCall.req$.subscribe({
      error: error => {
        if (error instanceof Error && error.message === 'BufferSubjectOverflow') {
          streamCall.res$.error(error);
        }
      },
    });
    subscribeCompleteObserver<T>(streamCall.res$, {
      next: (value: T) => {
        this.send(new ResponseDataMessage<T>(id, value));
      },
      error: (error: unknown) => {
        if (!streamCall.resFinalized) this.send(new ResponseErrorMessage<T>(id, this.error.format(error)));
        if (streamCall.reqFinalized) this.activeStreamCalls.delete(id);
      },
      complete: (value: T | undefined) => {
        if (!streamCall.resFinalized) this.send(new ResponseCompleteMessage<T>(id, value));
      },
    });
    const observable = this.caller.call$(name, new Observable<T>((observer) => {
      streamCall.req$.subscribe(observer);
      return () => {
        if (this.activeStreamCalls.has(id))
          this.send(new RequestUnsubscribeMessage(id));
        streamCall.req$.complete();
      };
    }), ctx) as Observable<T>;
    observable
      .subscribe({
        next: (value) => {
          streamCall.res$.next(value);
        },
        error: (error) => {
          streamCall.res$.error(error);
          this.activeStreamCalls.delete(id);
        },
        complete: () => {
          streamCall.res$.complete();
          this.activeStreamCalls.delete(id);
        },
      });
    return streamCall;
  }

  public onRequestDataMessage(message: RequestDataMessage<T>, ctx: Ctx): void {
    const {id, method, data} = message;
    let call = this.activeStreamCalls.get(id);
    if (!call) {
      if (!method) {
        this.sendError(id, RpcServerError.NoMethodSpecified);
        return;
      }
      call = this.createStreamCall(id, method, ctx);
    }
    if (call) {
      if (data !== undefined) {
        call.req$.next(data!);
      }
    }
  }

  public onRequestCompleteMessage(message: RequestCompleteMessage<T>, ctx: Ctx): void {
    const {id, method, data} = message;
    const call = this.activeStreamCalls.get(id);
    if (call) {
      call.reqFinalized = true;
      const {req$} = call;
      if (data !== undefined) req$.next(data as T);
      req$.complete();
      return;
    }
    if (!method) {
      this.sendError(id, RpcServerError.NoMethodSpecified);
      return;
    }
    if (!this.caller.exists(method)) {
      this.sendError(id, RpcServerError.MethodNotFound);
      return;
    }
    const rpcMethod = this.caller.get(method);
    if (rpcMethod.isStreaming) {
      const newCall = this.createStreamCall(id, method, ctx);
      if (newCall) {
        if (data !== undefined) {
          newCall.req$.next(data!);
        }
      }
    }
    else this.execStaticCall(id, method, data as T, ctx);
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

  public onRequestErrorMessage(message: RequestErrorMessage, ctx: Ctx): void {
    const {id, method, data} = message;
    const call = this.activeStreamCalls.get(id);
    if (call) {
      call.reqFinalized = true;
      return call.req$.error(data);
    }
    if (!method) return this.sendError(id, RpcServerError.NoMethodSpecified);
    if (!this.caller.exists(method)) return this.sendError(id, RpcServerError.MethodNotFound);
    const rpcMethod = this.caller.get(method);
    if (!rpcMethod.isStreaming) return this.sendError(id, RpcServerError.ErrorForStaticMethod);
    const streamCall = this.createStreamCall(id, rpcMethod, ctx);
    if (!streamCall) return;
    streamCall.req$.error(data);
  }

  public onUnsubscribeMessage(message: ResponseUnsubscribeMessage): void {
    const {id} = message;
    const call = this.activeStreamCalls.get(id);
    if (!call) return;
    call.resFinalized = true;
    this.activeStreamCalls.delete(id);
    call.res$.complete();
    call.req$.complete();
  }

  public onNotificationMessage(message: NotificationMessage<T>, ctx: Ctx): void {
    const {method, data} = message;
    if (!method || (method.length > 128))
      throw new RpcError(RpcServerError.InvalidNotificationName);
    this.onNotification(method, data, ctx);
  }
}
