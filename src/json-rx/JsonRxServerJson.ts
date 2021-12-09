import {json_string} from '../json-brand';
import {
  MessageSubscribe,
  MessageError,
  MessageData,
  MessageNotification,
  MessageUnsubscribe,
  MessageComplete,
  MessageOrMessageBatch,
} from './types';
import {Subscription, Observable, from, isObservable, of} from 'rxjs';
import {mergeMap} from 'rxjs/operators';
import {assertId, assertName, isArray, microtask} from './util';
import {TimedQueue} from './TimedQueue';
import {asString} from '../util/asString';

type IncomingMessage = MessageOrMessageBatch<MessageSubscribe | MessageUnsubscribe | MessageNotification>;
type OutgoingMessage = MessageOrMessageBatch<MessageData | MessageComplete | MessageError>;

interface ErrorLike {
  message: string;
  status?: number;
  code?: string;
  errno?: number;
  errorId?: number;
}

const formatError = (error: ErrorLike): json_string<ErrorLike> => {
  let json = '{"message":' + asString(error.message);
  if (typeof error.status === 'number') json += ',"status":' + error.status;
  if (typeof error.code === 'string') json += ',"code":' + asString(error.code);
  if (typeof error.errno === 'number') json += ',"errno":' + error.errno;
  if (typeof error.errorId === 'string') json += ',"errorId":' + asString(error.errorId);
  return (json + '}') as json_string<ErrorLike>;
};

export interface JsonRxServerParams<Ctx = unknown> {
  /**
   * Method to be called by server when it wants to send a message to the client.
   * This is usually your WebSocket "send" method.
   */
  send: (message: json_string<OutgoingMessage>) => void;

  /**
   * Callback called on the server when user sends a subscription message.
   */
  call: (
    name: string,
    payload: unknown,
    ctx: Ctx,
  ) => Promise<json_string<unknown>> | Observable<json_string<unknown>> | Promise<Observable<json_string<unknown>>>;

  /**
   * Callback called on the server when user sends a notification message.
   */
  notify: (name: string, payload: unknown, ctx: Ctx) => void;

  /**
   * Maximum number of active subscription in flight. This also includes
   * in-flight request/response subscriptions.
   */
  maxActiveSubscriptions?: number;

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

export class JsonRxServerJson<Ctx = unknown> {
  private send: (message: json_string<OutgoingMessage>) => void;
  private call: JsonRxServerParams<Ctx>['call'];
  private notify: JsonRxServerParams<Ctx>['notify'];
  private readonly active = new Map<number, Subscription>();
  private readonly maxActiveSubscriptions: number;

  constructor({
    send,
    call,
    notify,
    maxActiveSubscriptions = 30,
    bufferSize = 10,
    bufferTime = 1,
  }: JsonRxServerParams<Ctx>) {
    this.call = call;
    this.notify = notify;
    this.maxActiveSubscriptions = maxActiveSubscriptions;
    if (bufferTime) {
      const buffer = new TimedQueue<json_string<OutgoingMessage>>();
      buffer.itemLimit = bufferSize;
      buffer.timeLimit = bufferTime;
      buffer.onFlush = (messages) => {
        send(messages.length === 1 ? messages[0] : (('[' + messages.join(',') + ']') as json_string<OutgoingMessage>));
      };
      this.send = (message) => buffer.push(message);
    } else {
      this.send = send;
    }
  }

  private sendError(id: number, error: unknown): void {
    const message = ('[-1,' + id + ',' + JSON.stringify(error) + ']') as json_string<MessageError>;
    this.send(message);
  }

  private onSubscribe(message: MessageSubscribe, ctx: Ctx): void {
    const [id, name, payload] = message;
    assertId(id);
    assertName(name);
    try {
      const active = this.active.get(id);
      if (active) {
        this.active.delete(id);
        active.unsubscribe();
        this.send(('[-1,' + id + ',{"message":"ID already active."}]') as json_string<MessageError>);
        return;
      }
      if (this.active.size >= this.maxActiveSubscriptions)
        return this.sendError(id, {message: 'Too many subscriptions.'});
      const callResult = this.call(name, payload, ctx);
      const observable = isObservable(callResult)
        ? callResult
        : from(callResult).pipe(mergeMap((value) => (isObservable(value) ? value : of(value))));
      const ref: {buffer: json_string<unknown>[]} = {buffer: []};
      let done = false;
      const subscription = observable.subscribe(
        (data: json_string<unknown>) => {
          if (data === undefined) return;
          ref.buffer.push(data);
          microtask(() => {
            if (!ref.buffer.length) return;
            try {
              for (const payload of ref.buffer)
                this.send(('[-2,' + id + ',' + payload + ']') as json_string<MessageData>);
            } finally {
              ref.buffer = [];
            }
          });
        },
        (error: unknown) => {
          done = true;
          this.active.delete(id);
          let message: json_string<MessageError>;
          if (error instanceof Error) {
            message = ('[-1,' + id + ',' + formatError(error) + ']') as json_string<MessageError>;
          } else {
            message = ('[-1,' + id + ',' + JSON.stringify(error) + ']') as json_string<MessageError>;
          }
          this.send(message);
        },
        () => {
          done = true;
          this.active.delete(id);
          try {
            if (!ref.buffer.length) return this.send(`[0,${id}]` as json_string<MessageComplete>);
            const last = ref.buffer.length - 1;
            for (let i = 0; i <= last; i++) {
              const isLast = i === last;
              let message: json_string<MessageComplete | MessageData>;
              if (isLast) {
                message = ('[0,' + id + ',' + ref.buffer[i] + ']') as json_string<MessageComplete>;
              } else {
                message = ('[-2,' + id + ',' + ref.buffer[i] + ']') as json_string<MessageData>;
              }
              this.send(message);
            }
          } finally {
            ref.buffer = [];
          }
        },
      );
      if (!done) this.active.set(id, subscription);
    } catch (error) {
      this.sendError(id, error instanceof Error ? {message: error.message} : error);
    }
  }

  private onUnsubscribe(message: MessageUnsubscribe): void {
    const [, id] = message;
    assertId(id);
    const subscription = this.active.get(id);
    if (!subscription) return;
    this.active.delete(id);
    subscription.unsubscribe();
  }

  private onNotification(message: MessageNotification, ctx: Ctx): void {
    const [name, payload] = message;
    assertName(name);
    this.notify(name, payload, ctx);
  }

  public onMessage(message: IncomingMessage, ctx: Ctx): void {
    if (!isArray(message)) throw new Error('Invalid message');
    const [one] = message;
    if (isArray(one)) {
      for (let i = 0; i < message.length; i++) this.onMessage(message[i] as IncomingMessage, ctx);
      return;
    }
    if (typeof one === 'string') return this.onNotification(message as MessageNotification, ctx);
    if (one > 0) return this.onSubscribe(message as MessageSubscribe, ctx);
    if (one === -3) return this.onUnsubscribe(message as MessageUnsubscribe);
    throw new Error('Invalid message');
  }

  public stop() {
    this.send = (message: json_string<OutgoingMessage>) => {};
    for (const sub of this.active.values()) {
      sub.unsubscribe();
    }
  }
}
