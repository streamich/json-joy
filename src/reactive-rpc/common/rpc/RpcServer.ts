import {
  ReactiveRpcRequestMessage,
  ReactiveRpcResponseMessage,
  NotificationMessage,
  RequestCompleteMessage,
  RequestDataMessage,
  RequestErrorMessage,
  RequestUnsubscribeMessage,
  ResponseCompleteMessage,
  ResponseDataMessage,
  ResponseErrorMessage,
  ResponseUnsubscribeMessage,
} from '../messages/nominal';
import {subscribeCompleteObserver} from '../util/subscribeCompleteObserver';
import {TimedQueue} from '../util/TimedQueue';
import {RpcApi} from './types';
import {RpcServerError} from './constants';
import {ErrorFormatter, ErrorLikeErrorFormatter, RpcError} from './error';
import {Call, RpcApiCaller} from './RpcApiCaller';

export {RpcServerError};

type Send = (messages: (ReactiveRpcResponseMessage<unknown> | NotificationMessage<unknown>)[]) => void;

export interface RpcServerParams<Ctx = unknown> {
  caller: RpcApiCaller<any, Ctx>;
  error?: ErrorFormatter<unknown>;

  /**
   * Method to be called by server when it wants to send messages to the client.
   * This is usually your WebSocket "send" method.
   */
  send: Send;

  /**
   * Callback called on the server when user sends a notification message.
   */
  onNotification: (name: string, data: unknown | undefined, ctx: Ctx) => void;

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

export interface RpcServerFromApiParams<Ctx = unknown> extends Omit<RpcServerParams<Ctx>, 'onCall'> {
  api: RpcApi<Ctx, unknown>;
}

export class RpcServer<Ctx = unknown> {
  protected readonly caller: RpcApiCaller<any, Ctx>;
  public readonly error: ErrorFormatter<unknown>;

  private readonly activeStreamCalls: Map<number, Call<unknown, unknown>> = new Map();
  protected send: (message: ReactiveRpcResponseMessage<unknown> | NotificationMessage<unknown>) => void;

  /** Callback which sends message out of the server. */
  public onSend: Send;

  /** Callback called when server receives a notification. */
  public onNotification: RpcServerParams<Ctx>['onNotification'];

  constructor({caller, error, send, onNotification: notify, bufferSize = 10, bufferTime = 1}: RpcServerParams<Ctx>) {
    this.caller = caller;
    this.error = error || (new ErrorLikeErrorFormatter() as any);
    this.onNotification = notify;
    this.onSend = send;

    if (bufferTime) {
      const buffer = new TimedQueue<ReactiveRpcResponseMessage<unknown> | NotificationMessage<unknown>>();
      buffer.itemLimit = bufferSize;
      buffer.timeLimit = bufferTime;
      buffer.onFlush = (messages) => this.onSend(messages as any);
      this.send = (message) => {
        buffer.push(message as any);
      };
    } else {
      this.send = (message) => {
        this.onSend([message as any]);
      };
    }
  }

  protected notifMessage(method: string, data: unknown): NotificationMessage<unknown> {
    return new NotificationMessage(method, data);
  }

  protected resCompleteMessage(id: number, data: unknown): ResponseCompleteMessage<unknown> {
    return new ResponseCompleteMessage(id, data);
  }

  protected resDataMessage(id: number, data: unknown): ResponseDataMessage<unknown> {
    return new ResponseDataMessage(id, data);
  }

  protected resErrorMessage(id: number, data: unknown): ResponseErrorMessage<unknown> {
    return new ResponseErrorMessage(id, data);
  }

  protected reqUnsubscribeMessage(id: number): RequestUnsubscribeMessage {
    return new RequestUnsubscribeMessage(id);
  }

  protected createStaticCall(name: string, request: unknown, ctx: Ctx): Promise<unknown> {
    return this.caller.call(name, request, ctx);
  }

  protected execStaticCall(id: number, name: string, request: unknown, ctx: Ctx): void {
    this.createStaticCall(name, request, ctx)
      .then((response: unknown) => {
        this.send(this.resCompleteMessage(id, response));
      })
      .catch((error: unknown) => {
        this.send(this.resErrorMessage(id, error));
      });
  }

  protected createCall(name: string, ctx: Ctx): Call<unknown, unknown> {
    const streamCallback = (method: any, ctx: any, req$: any) => method.call$(ctx, req$);
    return this.caller.createCall(
      name,
      ctx,
      (name, req, ctx) => this.caller.call(name, req, ctx),
      streamCallback,
    ) as Call<unknown, unknown>;
  }

  protected onStreamError = (id: number, error: unknown): void => {
    this.send(this.resErrorMessage(id, error));
    this.activeStreamCalls.delete(id);
  };

  /**
   * Processes a single incoming Reactive-RPC message.
   *
   * This method will not throw.
   *
   * @param message A single Reactive-RPC message.
   * @param ctx Server context.
   */
  public onMessage(message: ReactiveRpcRequestMessage<unknown>, ctx: Ctx): void {
    try {
      if (message instanceof RequestDataMessage) this.onRequestDataMessage(message, ctx);
      else if (message instanceof RequestCompleteMessage) this.onRequestCompleteMessage(message, ctx);
      else if (message instanceof RequestErrorMessage) this.onRequestErrorMessage(message, ctx);
      else if (message instanceof NotificationMessage) this.onNotificationMessage(message, ctx);
      else if (message instanceof ResponseUnsubscribeMessage) this.onUnsubscribeMessage(message);
    } catch (error) {
      const formattedError = this.error.format(error);
      const message = this.notifMessage('.err', formattedError);
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
  public onMessages(messages: ReactiveRpcRequestMessage<unknown>[], ctx: Ctx): void {
    // This method should not throw.
    const length = messages.length;
    for (let i = 0; i < length; i++) this.onMessage(messages[i], ctx);
  }

  public stop(reason: RpcServerError = RpcServerError.Stop) {
    this.send = (() => {}) as any;
    this.onNotification = (name: string, data: unknown | undefined, ctx: Ctx) => {};
    for (const call of this.activeStreamCalls.values()) call.req$.error(new RpcError(reason));
    this.activeStreamCalls.clear();
  }

  public disconnect() {
    this.stop(RpcServerError.Disconnect);
  }

  private sendError(id: number, code: RpcServerError): void {
    const data = this.error.formatCode(code);
    const message = this.resErrorMessage(id, data);
    this.send(message);
  }

  private createStreamCall(id: number, name: string, ctx: Ctx): Call<unknown, unknown> {
    const call = this.createCall(name, ctx);
    this.activeStreamCalls.set(id, call);
    subscribeCompleteObserver<unknown>(call.res$, {
      next: (value: unknown) => {
        this.send(this.resDataMessage(id, value));
      },
      error: (error: unknown) => {
        this.onStreamError(id, error);
      },
      complete: (value: unknown) => {
        this.send(this.resCompleteMessage(id, value));
        this.activeStreamCalls.delete(id);
      },
    });
    call.reqUnsubscribe$.subscribe(() => {
      if (this.activeStreamCalls.has(id)) this.send(this.reqUnsubscribeMessage(id));
    });
    return call;
  }

  public onRequestDataMessage(message: RequestDataMessage<unknown>, ctx: Ctx): void {
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

  public onRequestCompleteMessage(message: RequestCompleteMessage<unknown>, ctx: Ctx): void {
    const {id, method, data} = message;
    const call = this.activeStreamCalls.get(id);
    if (call) {
      const {req$} = call;
      if (data !== undefined) req$.next(data);
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
          newCall.req$.complete();
        }
      }
    } else this.execStaticCall(id, method, data, ctx);
  }

  public onRequestErrorMessage(message: RequestErrorMessage, ctx: Ctx): void {
    const {id, method, data} = message;
    const call = this.activeStreamCalls.get(id);
    if (call) {
      return call.req$.error(data);
    }
    if (!method) return this.sendError(id, RpcServerError.NoMethodSpecified);
    if (!this.caller.exists(method)) return this.sendError(id, RpcServerError.MethodNotFound);
    const rpcMethod = this.caller.get(method);
    if (!rpcMethod.isStreaming) return this.sendError(id, RpcServerError.ErrorForStaticMethod);
    const streamCall = this.createStreamCall(id, method, ctx);
    if (!streamCall) return;
    streamCall.req$.error(data);
  }

  public onUnsubscribeMessage(message: ResponseUnsubscribeMessage): void {
    const {id} = message;
    const call = this.activeStreamCalls.get(id);
    if (!call) return;
    this.activeStreamCalls.delete(id);
    call.req$.complete();
  }

  public onNotificationMessage(message: NotificationMessage<unknown>, ctx: Ctx): void {
    const {method, data} = message;
    if (!method || method.length > 128) throw new RpcError(RpcServerError.InvalidNotificationName);
    this.onNotification(method, data, ctx);
  }
}
