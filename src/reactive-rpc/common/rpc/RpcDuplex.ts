import {Observable} from 'rxjs';
import * as msg from '../messages';
import {StreamingRpcClient} from './client/StreamingRpcClient';
import {RpcMessageStreamProcessor} from './RpcMessageStreamProcessor';

export interface RpcDuplexParams<Ctx = unknown> {
  client: StreamingRpcClient;
  server: RpcMessageStreamProcessor<Ctx>;
}

export class RpcDuplex<Ctx = unknown> {
  public readonly client: StreamingRpcClient;
  public readonly server: RpcMessageStreamProcessor<Ctx>;

  public constructor(params: RpcDuplexParams<Ctx>) {
    this.client = params.client;
    this.server = params.server;
  }

  public onMessages(messages: msg.ReactiveRpcMessage[], ctx: Ctx): void {
    const length = messages.length;
    for (let i = 0; i < length; i++) this.onMessage(messages[i], ctx);
  }

  public onMessage(message: msg.ReactiveRpcMessage, ctx: Ctx): void {
    if (message instanceof msg.RequestDataMessage) this.server.onRequestDataMessage(message, ctx);
    else if (message instanceof msg.RequestCompleteMessage) this.server.onRequestCompleteMessage(message, ctx);
    else if (message instanceof msg.RequestErrorMessage) this.server.onRequestErrorMessage(message, ctx);
    else if (message instanceof msg.ResponseUnsubscribeMessage) this.server.onUnsubscribeMessage(message);
    else if (message instanceof msg.NotificationMessage) this.server.onNotificationMessage(message, ctx);
    else if (message instanceof msg.ResponseCompleteMessage) return this.client.onResponseComplete(message);
    else if (message instanceof msg.ResponseDataMessage) return this.client.onResponseData(message);
    else if (message instanceof msg.ResponseErrorMessage) return this.client.onResponseError(message);
    else if (message instanceof msg.RequestUnsubscribeMessage) return this.client.onRequestUnsubscribe(message);
  }

  public call$(method: string, data: unknown): Observable<unknown>;
  public call$(method: string, data: Observable<unknown>): Observable<unknown>;
  public call$(method: string, data: unknown | Observable<unknown>): Observable<unknown> {
    return this.client.call$(method, data as any);
  }

  public call(method: string, data: unknown): Promise<unknown> {
    return this.client.call(method, data);
  }

  public notify(method: string, data: undefined | unknown): void {
    this.client.notify(method, data);
  }

  public stop() {
    this.client.stop();
    this.server.stop();
  }

  public disconnect() {
    this.client.disconnect();
    this.server.disconnect();
  }
}
