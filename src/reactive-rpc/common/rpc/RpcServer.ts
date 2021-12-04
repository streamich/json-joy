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
import {JSON, json_string} from '../../../json-brand';
import {MsgPack} from '../../../json-pack';
import {encodeFull} from '../../../json-pack/util';

export {RpcServerError};

type Send<T> = (messages: (ReactiveRpcResponseMessage<T> | NotificationMessage<T>)[]) => void;
type SendJson<T> = (
  messages: (ReactiveRpcResponseMessage<json_string<T>> | NotificationMessage<json_string<T>>)[],
) => void;
type SendMsgPack<T> = (messages: (ReactiveRpcResponseMessage<MsgPack<T>> | NotificationMessage<MsgPack<T>>)[]) => void;

/**
 * Specifies the encoding of the responses.
 */
export const enum RpcServerResponseType {
  /** Plain JavaScript values. */
  POJO = 1,
  /** JSON-encoded. */
  JSON = 2,
  /** MessagePack-encoded. */
  PACK = 3,
}

export interface RpcServerParams<Ctx = unknown, T = unknown> {
  caller: RpcApiCaller<any, Ctx>;
  callType?: RpcServerResponseType;
  error?: ErrorFormatter<T>;

  /**
   * Method to be called by server when it wants to send messages to the client.
   * This is usually your WebSocket "send" method.
   */
  send: Send<T> | SendJson<T> | SendMsgPack<T>;
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

export class RpcServer<Ctx = unknown, T = unknown> {
  private readonly caller: RpcApiCaller<any, Ctx>;
  private readonly callType: RpcServerResponseType;
  public readonly error: ErrorFormatter<T>;

  private readonly activeStreamCalls: Map<number, Call<T, T | json_string<T> | MsgPack<T>>> = new Map();
  private send: (message: ReactiveRpcResponseMessage<unknown> | NotificationMessage<unknown>) => void;

  /** Callback which sends message out of the server. */
  public onSend: Send<T> | SendJson<T> | SendMsgPack<T>;

  /** Callback called when server receives a notification. */
  public onNotification: RpcServerParams<Ctx, T>['onNotification'];

  private execStaticCall: (id: number, name: string, request: T, ctx: Ctx) => void;
  private createCall: <R>(name: string, ctx: Ctx) => Call<any, any>;
  private onStreamError: (id: number, error: unknown) => void;

  constructor({
    caller,
    callType,
    error,
    send,
    onNotification: notify,
    bufferSize = 10,
    bufferTime = 1,
  }: RpcServerParams<Ctx, T>) {
    this.caller = caller;
    this.callType = callType || RpcServerResponseType.POJO;
    this.error = error || (new ErrorLikeErrorFormatter() as any);
    this.onNotification = notify;
    this.onSend = send;

    if (bufferTime) {
      const buffer = new TimedQueue<ReactiveRpcResponseMessage<T> | NotificationMessage<T>>();
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

    if (this.callType === RpcServerResponseType.POJO) {
      this.execStaticCall = (id: number, name: string, request: T, ctx: Ctx) => {
        this.caller
          .call(name, request, ctx)
          .then((response) => {
            this.send(new ResponseCompleteMessage<T>(id, response as T));
          })
          .catch((error) => {
            // const formattedError = this.error.format(error);
            const formattedError = error;
            this.send(new ResponseErrorMessage<T>(id, formattedError));
          });
      };
    } else if (this.callType === RpcServerResponseType.JSON) {
      this.execStaticCall = (id: number, name: string, request: T, ctx: Ctx) => {
        this.caller
          .callJson(name, request, ctx)
          .then((response) => {
            this.send(new ResponseCompleteMessage<json_string<T>>(id, response as json_string<T>));
          })
          .catch((error) => {
            // const formattedError = this.error.format(error);
            const formattedError = error;
            const payload = JSON.stringify(formattedError);
            this.send(new ResponseErrorMessage<json_string<T>>(id, payload));
          });
      };
    } else {
      this.execStaticCall = (id: number, name: string, request: T, ctx: Ctx) => {
        this.caller
          .callMsgPack(name, request, ctx)
          .then((response) => {
            this.send(new ResponseCompleteMessage<MsgPack<T>>(id, response as MsgPack<T>));
          })
          .catch((error) => {
            // const formattedError = this.error.format(error);
            const formattedError = error;
            const payload = encodeFull(formattedError);
            this.send(new ResponseErrorMessage<MsgPack<T>>(id, payload));
          });
      };
    }

    if (this.callType === RpcServerResponseType.PACK) {
      const streamCallback = (method: any, ctx: any, req$: any) => method.callMsgPack$(ctx, req$);
      this.createCall = (name: string, ctx: Ctx) =>
        this.caller.createCall(
          name,
          ctx,
          (name, req, ctx) => this.caller.callMsgPack(name, req, ctx),
          streamCallback,
        ) as Call<T, MsgPack<T>>;
      this.onStreamError = (id: number, error: unknown) => {
        const formattedError = error as T;
        const payload = encodeFull(formattedError);
        this.send(new ResponseErrorMessage<MsgPack<T>>(id, payload));
        this.activeStreamCalls.delete(id);
      };
    } else if (this.callType === RpcServerResponseType.JSON) {
      const streamCallback = (method: any, ctx: any, req$: any) => method.callJson$(ctx, req$);
      this.createCall = (name: string, ctx: Ctx) =>
        this.caller.createCall(
          name,
          ctx,
          (name, req, ctx) => this.caller.callJson(name, req, ctx),
          streamCallback,
        ) as Call<T, json_string<T>>;
      this.onStreamError = (id: number, error: unknown) => {
        const formattedError = error as T;
        const payload = JSON.stringify(formattedError);
        this.send(new ResponseErrorMessage<json_string<T>>(id, payload));
        this.activeStreamCalls.delete(id);
      };
    } else {
      const streamCallback = (method: any, ctx: any, req$: any) => method.call$(ctx, req$);
      this.createCall = (name: string, ctx: Ctx) =>
        this.caller.createCall(name, ctx, (name, req, ctx) => this.caller.call(name, req, ctx), streamCallback) as Call<
          T,
          T
        >;
      this.onStreamError = (id: number, error: unknown) => {
        this.send(new ResponseErrorMessage<T>(id, error as T));
        this.activeStreamCalls.delete(id);
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
    this.send = (() => {}) as any;
    this.onNotification = (name: string, data: T | undefined, ctx: Ctx) => {};
    for (const call of this.activeStreamCalls.values()) call.req$.error(new RpcError(reason));
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

  private createStreamCall(id: number, name: string, ctx: Ctx): Call<T, T | json_string<T> | MsgPack<T>> {
    const call = this.createCall(name, ctx);
    this.activeStreamCalls.set(id, call);
    subscribeCompleteObserver<T | json_string<T> | MsgPack<T>>(call.res$, {
      next: (value: T | json_string<T> | MsgPack<T>) => {
        this.send(new ResponseDataMessage<T | json_string<T> | MsgPack<T>>(id, value));
      },
      error: (error: unknown) => {
        this.onStreamError(id, error);
      },
      complete: (value: T | json_string<T> | MsgPack<T> | undefined) => {
        this.send(new ResponseCompleteMessage<T | json_string<T> | MsgPack<T>>(id, value));
        this.activeStreamCalls.delete(id);
      },
    });
    call.reqUnsubscribe$.subscribe(() => {
      if (this.activeStreamCalls.has(id)) this.send(new RequestUnsubscribeMessage(id));
    });
    return call;
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
          newCall.req$.complete();
        }
      }
    } else this.execStaticCall(id, method, data as T, ctx);
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

  public onNotificationMessage(message: NotificationMessage<T>, ctx: Ctx): void {
    const {method, data} = message;
    if (!method || method.length > 128) throw new RpcError(RpcServerError.InvalidNotificationName);
    this.onNotification(method, data, ctx);
  }
}
