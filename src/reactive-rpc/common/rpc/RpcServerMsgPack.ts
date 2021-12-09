import {RpcServer} from './RpcServer';
import type {Call} from './RpcApiCaller';
import {
  BinaryNotificationMessage,
  BinaryResponseCompleteMessage,
  BinaryResponseDataMessage,
  BinaryResponseErrorMessage,
  BinaryRequestUnsubscribeMessage,
} from '../messages/binary';
import {encodeFull} from '../../../json-pack/util';

export class RpcServerMsgPack<Ctx = unknown> extends RpcServer<Ctx> {
  protected notifMessage(method: string, data: unknown): BinaryNotificationMessage {
    return new BinaryNotificationMessage(method, encodeFull(data));
  }

  protected resCompleteMessage(id: number, data: unknown): BinaryResponseCompleteMessage {
    return new BinaryResponseCompleteMessage(id, data as Uint8Array | undefined);
  }

  protected resDataMessage(id: number, data: unknown): BinaryResponseDataMessage {
    return new BinaryResponseDataMessage(id, data as Uint8Array);
  }

  protected resErrorMessage(id: number, data: unknown): BinaryResponseErrorMessage {
    return new BinaryResponseErrorMessage(id, encodeFull(data));
  }

  protected reqUnsubscribeMessage(id: number): BinaryRequestUnsubscribeMessage {
    return new BinaryRequestUnsubscribeMessage(id);
  }

  protected createStaticCall(name: string, request: unknown, ctx: Ctx): Promise<unknown> {
    return this.caller.callMsgPack(name, request, ctx);
  }

  protected createCall(name: string, ctx: Ctx): Call<unknown, unknown> {
    const streamCallback = (method: any, ctx: any, req$: any) => method.callMsgPack$(ctx, req$);
    return this.caller.createCall(
      name,
      ctx,
      (name, req, ctx) => this.caller.callMsgPack(name, req, ctx),
      streamCallback,
    ) as Call<unknown, unknown>;
  }
}
