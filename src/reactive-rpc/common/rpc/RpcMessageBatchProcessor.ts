import * as msg from '../messages';
import {RpcError, RpcErrorValue} from './caller';
import {validateId, validateMethod} from './validation';
import type {RpcCaller} from './caller/RpcCaller';

export type IncomingBatchMessage =
  | msg.RequestDataMessage
  | msg.RequestCompleteMessage
  | msg.RequestErrorMessage
  | msg.NotificationMessage;
export type OutgoingBatchMessage = msg.ResponseCompleteMessage | msg.ResponseErrorMessage;

export interface RpcMessageBatchProcessorOptions<Ctx = unknown> {
  caller: RpcCaller<Ctx>;
}

/**
 * A global instance for processing RPC messages. Used for request/response like
 * scenarios. For streaming scenarios, use `RpcMessageStreamProcessor`.
 *
 * This processor can be shared across different connection/requests as "ctx"
 * is passed on each call and not state is held.
 */
export class RpcMessageBatchProcessor<Ctx = unknown> {
  protected readonly caller: RpcCaller<Ctx>;

  constructor({caller}: RpcMessageBatchProcessorOptions<Ctx>) {
    this.caller = caller;
  }

  public async onBatch(list: IncomingBatchMessage[], ctx: Ctx): Promise<OutgoingBatchMessage[]> {
    try {
      const promises: Promise<OutgoingBatchMessage>[] = [];
      const length = list.length;
      for (let i = 0; i < length; i++) {
        const message = list[i];
        switch (message.constructor) {
          case msg.NotificationMessage:
            this.onNotification(message as msg.NotificationMessage, ctx);
            break;
          case msg.RequestDataMessage:
          case msg.RequestCompleteMessage:
          case msg.RequestErrorMessage:
            promises.push(
              this.onRequest(
                message as msg.RequestDataMessage | msg.RequestCompleteMessage | msg.RequestErrorMessage,
                ctx,
              ),
            );
            break;
        }
      }
      const settled = await Promise.allSettled(promises);
      const result: OutgoingBatchMessage[] = [];
      const settledLength = settled.length;
      for (let i = 0; i < settledLength; i++) {
        const item = settled[i];
        result.push(item.status === 'fulfilled' ? item.value : item.reason);
      }
      return result;
    } catch (error) {
      const value = RpcError.internalErrorValue(error);
      return [new msg.ResponseErrorMessage(-1, value)];
    }
  }

  public onNotification(message: msg.NotificationMessage, ctx: Ctx): void {
    const method = message.method;
    validateMethod(method);
    this.caller.notification(method, message.value.data, ctx).catch((error: unknown) => {});
  }

  public async onRequest(
    message: msg.RequestDataMessage | msg.RequestCompleteMessage | msg.RequestErrorMessage,
    ctx: Ctx,
  ): Promise<OutgoingBatchMessage> {
    const id = message.id;
    validateId(id);
    const method = message.method;
    validateMethod(method);
    try {
      const value = message.value;
      const data = value ? value.data : undefined;
      const result = await this.caller.call(method, data, ctx);
      return new msg.ResponseCompleteMessage(id, result);
    } catch (error) {
      throw new msg.ResponseErrorMessage(id, error as RpcErrorValue);
    }
  }
}
