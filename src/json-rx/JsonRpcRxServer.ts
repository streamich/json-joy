import {
  MessageSubscribe,
  MessageError,
  MessageNotification,
  MessageComplete,
  MessageOrMessageBatch,
  MessageBatch,
} from './types';
import {assertId, assertName, isArray} from './util';

type Call<Context> = (name: string, ctx: Context, payload?: unknown) => Promise<unknown>;
type Notify<Context> = (name: string, ctx: Context, payload?: unknown) => void;

export interface JsonRpcRxServerParams<Context> {
  call: Call<Context>;
  notify: Notify<Context>;
}

export class JsonRpcRxServer<Context = unknown> {
  private call: Call<Context>;
  private notify: Notify<Context>;

  constructor({call, notify}: JsonRpcRxServerParams<Context>) {
    this.call = call;
    this.notify = notify;
  }

  private async onSubscribe(ctx: Context, message: MessageSubscribe): Promise<MessageComplete> {
    const [id, name, payload] = message;
    assertId(id);
    assertName(name);
    const result = await this.call(name, ctx, payload);
    return [0, id, result];
  }

  private onNotification(ctx: Context, message: MessageNotification): void {
    const [name, payload] = message;
    assertName(name);
    this.notify(name, ctx, payload);
  }

  public async onMessage(
    ctx: Context,
    message: MessageOrMessageBatch,
  ): Promise<MessageOrMessageBatch<MessageComplete | MessageError> | null> {
    try {
      if (!isArray(message)) throw new Error('Invalid message');
      if (!message.length) return null;
      if (isArray(message[0]))
        return (await Promise.all(
          (message as MessageBatch).map((msg) => this.onMessage(ctx, msg)),
        )) as MessageOrMessageBatch<MessageComplete | MessageError> | null;
      const [one] = message;
      if (typeof one === 'string') {
        this.onNotification(ctx, message as MessageNotification);
        return null;
      }
      if (one > 0) return await this.onSubscribe(ctx, message as MessageSubscribe);
      throw new Error('Invalid message');
    } catch (error) {
      const id =
        isArray(message) && typeof message[0] === 'number' && message[0] > 0 && Math.round(message[0]) === message[0]
          ? message[0]
          : -1;
      return [-1, id, {message: error instanceof Error ? error.message : String(error)}];
    }
  }
}
