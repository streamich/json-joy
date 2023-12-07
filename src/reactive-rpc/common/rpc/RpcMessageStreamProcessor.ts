import * as msg from '../messages';
import {subscribeCompleteObserver} from '../util/subscribeCompleteObserver';
import {TimedQueue} from '../util/TimedQueue';
import {RpcErrorCodes, RpcError} from './caller/error';
import {RpcValue} from '../messages/Value';
import type {RpcCaller} from './caller/RpcCaller';
import type {Call, RpcApiMap} from './caller/types';

type Send = (messages: (msg.ReactiveRpcServerMessage | msg.NotificationMessage)[]) => void;

export interface RpcMessageStreamProcessorOptions<Ctx = unknown> {
  caller: RpcCaller<Ctx>;

  /**
   * Method to be called by server when it wants to send messages to the client.
   * This is usually your WebSocket "send" method.
   */
  send: Send;

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

export interface RpcMessageStreamProcessorFromApiOptions<Ctx = unknown>
  extends Omit<RpcMessageStreamProcessorOptions<Ctx>, 'onCall'> {
  api: RpcApiMap<Ctx>;
}

export class RpcMessageStreamProcessor<Ctx = unknown> {
  protected readonly caller: RpcCaller<Ctx>;
  private readonly activeStreamCalls: Map<number, Call<unknown, unknown>> = new Map();
  protected send: (message: msg.ReactiveRpcServerMessage | msg.NotificationMessage) => void;

  /** Callback which sends message out of the server. */
  public onSend: Send;

  constructor({caller, send, bufferSize = 10, bufferTime = 1}: RpcMessageStreamProcessorOptions<Ctx>) {
    this.caller = caller;
    this.onSend = send;

    if (bufferTime) {
      const buffer = new TimedQueue<msg.ReactiveRpcServerMessage | msg.NotificationMessage>();
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

  /**
   * Processes a single incoming Reactive-RPC message.
   *
   * @param message A single Reactive-RPC message.
   * @param ctx Server context.
   */
  public onMessage(message: msg.ReactiveRpcClientMessage, ctx: Ctx): void {
    if (message instanceof msg.RequestDataMessage) this.onRequestDataMessage(message, ctx);
    else if (message instanceof msg.RequestCompleteMessage) this.onRequestCompleteMessage(message, ctx);
    else if (message instanceof msg.RequestErrorMessage) this.onRequestErrorMessage(message, ctx);
    else if (message instanceof msg.NotificationMessage) this.onNotificationMessage(message, ctx);
    else if (message instanceof msg.ResponseUnsubscribeMessage) this.onUnsubscribeMessage(message);
  }

  /**
   * Receives a list of all incoming messages from the client to process.
   *
   * @param messages A list of received messages.
   * @param ctx Server context.
   */
  public onMessages(messages: msg.ReactiveRpcClientMessage[], ctx: Ctx): void {
    const length = messages.length;
    for (let i = 0; i < length; i++) this.onMessage(messages[i], ctx);
  }

  public sendNotification(method: string, value: RpcValue): void {
    const message = new msg.NotificationMessage(method, value);
    this.send(message);
  }

  protected sendCompleteMessage(id: number, value: RpcValue | undefined): void {
    const message = new msg.ResponseCompleteMessage(id, value);
    this.send(message);
  }

  protected sendDataMessage(id: number, value: RpcValue): void {
    const message = new msg.ResponseDataMessage(id, value);
    this.send(message);
  }

  protected sendErrorMessage(id: number, value: RpcValue): void {
    const message = new msg.ResponseErrorMessage(id, value);
    this.send(message);
  }

  protected sendUnsubscribeMessage(id: number): void {
    const message = new msg.RequestUnsubscribeMessage(id);
    this.send(message);
  }

  protected execStaticCall(id: number, name: string, request: unknown, ctx: Ctx): void {
    this.caller
      .call(name, request, ctx)
      .then((value: RpcValue) => this.sendCompleteMessage(id, value))
      .catch((value: RpcValue) => this.sendErrorMessage(id, value));
  }

  protected onStreamError = (id: number, error: RpcValue): void => {
    this.sendErrorMessage(id, error);
    this.activeStreamCalls.delete(id);
  };

  public stop(reason: RpcErrorCodes = RpcErrorCodes.STOP) {
    this.send = (() => {}) as any;
    for (const call of this.activeStreamCalls.values()) call.req$.error(RpcError.valueFromCode(reason));
    this.activeStreamCalls.clear();
  }

  public disconnect() {
    this.stop(RpcErrorCodes.DISCONNECT);
  }

  private sendError(id: number, code: RpcErrorCodes): void {
    const data = RpcError.valueFromCode(code);
    this.sendErrorMessage(id, data);
  }

  private createStreamCall(id: number, name: string, ctx: Ctx): Call<unknown, unknown> {
    const call = this.caller.createCall(name, ctx);
    this.activeStreamCalls.set(id, call);
    subscribeCompleteObserver<RpcValue>(call.res$, {
      next: (value: RpcValue) => this.sendDataMessage(id, value),
      error: (error: unknown) => this.onStreamError(id, error as RpcValue),
      complete: (value: RpcValue | undefined) => {
        this.activeStreamCalls.delete(id);
        this.sendCompleteMessage(id, value);
      },
    });
    call.reqUnsubscribe$.subscribe(() => {
      if (this.activeStreamCalls.has(id)) this.sendUnsubscribeMessage(id);
    });
    return call;
  }

  public onRequestDataMessage(message: msg.RequestDataMessage, ctx: Ctx): void {
    const {id, method, value} = message;
    let call = this.activeStreamCalls.get(id);
    if (!call) {
      if (!method) {
        this.sendError(id, RpcErrorCodes.NO_METHOD_SPECIFIED);
        return;
      }
      const info = this.caller.info(method);
      if (!info) {
        this.sendError(id, RpcErrorCodes.METHOD_NOT_FOUND);
        return;
      }
      if (info.isStreaming) {
        call = this.createStreamCall(id, method, ctx);
      } else {
        this.execStaticCall(id, method, value ? value.data : undefined, ctx);
        return;
      }
    }
    if (call) {
      const data = value ? value.data : undefined;
      if (data !== undefined) {
        call.req$.next(data);
      }
    }
  }

  public onRequestCompleteMessage(message: msg.RequestCompleteMessage, ctx: Ctx): void {
    const {id, method, value} = message;
    const call = this.activeStreamCalls.get(id);
    if (call) {
      const {req$} = call;
      const data = value ? value.data : undefined;
      if (data !== undefined) req$.next(data);
      req$.complete();
      return;
    }
    if (!method) {
      this.sendError(id, RpcErrorCodes.NO_METHOD_SPECIFIED);
      return;
    }
    const caller = this.caller;
    if (!caller.exists(method)) {
      this.sendError(id, RpcErrorCodes.METHOD_NOT_FOUND);
      return;
    }
    const {isStreaming} = caller.info(method);
    const data = value ? value.data : undefined;
    if (isStreaming) {
      const newCall = this.createStreamCall(id, method, ctx);
      if (newCall) {
        if (data !== undefined) {
          newCall.req$.next(data);
          newCall.req$.complete();
        }
      }
    } else this.execStaticCall(id, method, data, ctx);
  }

  public onRequestErrorMessage(message: msg.RequestErrorMessage, ctx: Ctx): void {
    const {id, method, value} = message;
    const call = this.activeStreamCalls.get(id);
    if (call) return call.req$.error(value.data);
    if (!method) return this.sendError(id, RpcErrorCodes.NO_METHOD_SPECIFIED);
    if (!this.caller.exists(method)) return this.sendError(id, RpcErrorCodes.METHOD_NOT_FOUND);
    const {isStreaming} = this.caller.info(method);
    if (!isStreaming) return this.sendError(id, RpcErrorCodes.INVALID_METHOD);
    const streamCall = this.createStreamCall(id, method, ctx);
    if (!streamCall) return;
    streamCall.req$.error(value.data);
  }

  public onUnsubscribeMessage(message: msg.ResponseUnsubscribeMessage): void {
    const {id} = message;
    const call = this.activeStreamCalls.get(id);
    if (!call) return;
    this.activeStreamCalls.delete(id);
    call.req$.complete();
  }

  public onNotificationMessage(message: msg.NotificationMessage, ctx: Ctx): void {
    const {method, value} = message;
    if (!method || method.length > 128) throw RpcError.fromCode(RpcErrorCodes.INVALID_METHOD);
    const request = value && typeof value === 'object' ? value?.data : undefined;
    this.caller.notification(method, request, ctx).catch((error: unknown) => {});
  }
}
