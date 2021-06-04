import {Observable} from "rxjs";
import {NotificationMessage, ReactiveRpcMessage, RequestCompleteMessage, RequestDataMessage, RequestErrorMessage, RequestUnsubscribeMessage, ResponseCompleteMessage, ResponseDataMessage, ResponseErrorMessage, ResponseUnsubscribeMessage} from "../messages/nominal";
import {RpcClient} from "./RpcClient";
import {RpcServer} from "./RpcServer";

export interface RpcDuplexParams<Ctx = unknown, T = unknown> {
  client: RpcClient<T>;
  server: RpcServer<Ctx, T>;
}

export class RpcDuplex<Ctx = unknown, T = unknown> {
  public readonly client: RpcClient<T>;
  public readonly server: RpcServer<Ctx, T>;

  public constructor(params: RpcDuplexParams<Ctx, T>) {
    this.client = params.client;
    this.server = params.server;
  }

  public onMessages(messages: ReactiveRpcMessage<T>[], ctx: Ctx): void {
    const length = messages.length;
    for (let i = 0; i < length; i++) this.onMessage(messages[i], ctx);
  }

  public onMessage(message: ReactiveRpcMessage<T>, ctx: Ctx): void {
    if (message instanceof RequestDataMessage) this.server.onRequestData(message, ctx);
    else if (message instanceof RequestCompleteMessage) this.server.onRequestComplete(message, ctx);
    else if (message instanceof RequestErrorMessage) this.server.onRequestError(message, ctx);
    else if (message instanceof ResponseUnsubscribeMessage) this.server.onUnsubscribe(message);
    else if (message instanceof NotificationMessage) this.server.onNotification(message, ctx);
    else if (message instanceof ResponseCompleteMessage) return this.client.onResponseComplete(message);
    else if (message instanceof ResponseDataMessage) return this.client.onResponseData(message);
    else if (message instanceof ResponseErrorMessage) return this.client.onResponseError(message);
    else if (message instanceof RequestUnsubscribeMessage) return this.client.onRequestUnsubscribe(message);
  }

  public call$(method: string, data: T): Observable<T>;
  public call$(method: string, data: Observable<T>): Observable<T>;
  public call$(method: string, data: T | Observable<T>): Observable<T> {
    return this.client.call$(method, data as any);
  }

  public notify(method: string, data: undefined | T): void {
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
