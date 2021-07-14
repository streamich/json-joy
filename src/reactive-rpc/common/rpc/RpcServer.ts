import {EMPTY, from, Observable, Subject} from 'rxjs';
import {catchError, switchMap, take} from 'rxjs/operators';
import {BufferSubject} from '../../../util/BufferSubject';
import {ReactiveRpcRequestMessage, ReactiveRpcResponseMessage, NotificationMessage, RequestCompleteMessage, RequestDataMessage, RequestErrorMessage, RequestUnsubscribeMessage, ResponseCompleteMessage, ResponseDataMessage, ResponseErrorMessage, ResponseUnsubscribeMessage} from '../messages/nominal';
import {subscribeCompleteObserver} from '../util/subscribeCompleteObserver';
import {TimedQueue} from '../util/TimedQueue';
import {IRpcApiCaller, RpcApi, RpcMethod, RpcMethodStatic, RpcMethodStreaming} from './types';
import {RpcServerError} from './constants';

export {RpcServerError};

export interface RpcServerParams<Ctx = unknown, T = unknown> {
  caller: IRpcApiCaller<any, Ctx>;

  /**
   * Method to be called by server when it wants to send messages to the client.
   * This is usually your WebSocket "send" method.
   */
  send: (messages: ReactiveRpcResponseMessage<T>[]) => void;

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
  public readonly req$: BufferSubject<T>;
  public readonly res$: Subject<T> = new Subject();

  constructor (preCallBufferSize: number) {
    this.req$ = new BufferSubject(preCallBufferSize);
  }
}

export class RpcServer<Ctx = unknown, T = unknown> {
  private readonly caller: IRpcApiCaller<any, Ctx>;
  private readonly activeStreamCalls: Map<number, StreamCall<T>> = new Map();
  private send: (message: ReactiveRpcResponseMessage<T>) => void;

  /** Callback which sends message out of the server. */
  public onSend: (messages: ReactiveRpcResponseMessage<T>[]) => void;

  /** Callback called when server receives a notification. */
  public onNotification: RpcServerParams<Ctx, T>['onNotification'];

  constructor({
    caller,
    send,
    onNotification: notify,
    bufferSize = 10,
    bufferTime = 1,
  }: RpcServerParams<Ctx, T>) {
    this.caller = caller;
    this.onNotification = notify;
    this.onSend = send;
    if (bufferTime) {
      const buffer = new TimedQueue<ReactiveRpcResponseMessage<T>>();
      buffer.itemLimit = bufferSize;
      buffer.timeLimit = bufferTime;
      buffer.onFlush = messages => this.onSend(messages);
      this.send = (message) => {
        buffer.push(message);
      };
    } else {
      this.send = message => this.onSend([message]);
    }
  }

  public onMessage(message: ReactiveRpcRequestMessage<T>, ctx: Ctx): void {
    if (message instanceof RequestDataMessage) this.onRequestDataMessage(message, ctx);
    else if (message instanceof RequestCompleteMessage) this.onRequestCompleteMessage(message, ctx);
    else if (message instanceof RequestErrorMessage) this.onRequestErrorMessage(message, ctx);
    else if (message instanceof NotificationMessage) this.onNotificationMessage(message, ctx);
    else if (message instanceof ResponseUnsubscribeMessage) this.onUnsubscribeMessage(message);
  }

  public onMessages(messages: ReactiveRpcRequestMessage<T>[], ctx: Ctx): void {
    const length = messages.length;
    for (let i = 0; i < length; i++) this.onMessage(messages[i], ctx);
  }

  public stop(reason: RpcServerError = RpcServerError.Stop) {
    this.send = (message: ReactiveRpcResponseMessage<T>) => {};
    this.onNotification = (name: string, data: T | undefined, ctx: Ctx) => {};
    for (const call of this.activeStreamCalls.values()) {
      // call.req$.error(this.error.formatCode(reason));
      // call.res$.error(this.error.formatCode(reason));
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
        // const formattedError = this.error.format(error);
        // this.send(new ResponseErrorMessage<T>(id, formattedError));
        this.send(new ResponseErrorMessage<T>(id, error));
      });
  }

  private createStreamCall(id: number, name: string, ctx: Ctx): StreamCall<T> | undefined {
    const streamCall = new StreamCall<T>(1);
    this.activeStreamCalls.set(id, streamCall);
    streamCall.req$.subscribe({
      error: error => {
        if (error instanceof Error && error.message === 'BufferSubjectOverflow') {
          streamCall.res$.error(error);
        }
      },
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
        // if (!streamCall.resFinalized) this.send(new ResponseErrorMessage<T>(id, this.error.format(error)));
        if (!streamCall.resFinalized) this.send(new ResponseErrorMessage<T>(id, error as T));
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
    const observable = this.caller.call$(name, new Observable<T>((observer) => {
      streamCall.req$.subscribe(observer);
      return () => {
        if (!streamCall.reqFinalized)
          this.send(new RequestUnsubscribeMessage(id));
        streamCall.req$.complete();
      };
    }), ctx) as Observable<T>;
    observable.subscribe(streamCall.res$);
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
    this.execStaticCall(id, method, data as T, ctx);
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
    const rpcMethod = this.getRpcMethod(method);
    if (!rpcMethod) return this.sendError(id, RpcServerError.MethodNotFound);
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
  }

  public onNotificationMessage(message: NotificationMessage<T>, ctx: Ctx): void {
    const {method, data} = message;
    this.onNotification(method, data, ctx);
  }
}
