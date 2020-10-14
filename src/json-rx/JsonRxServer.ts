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
import { TimedQueue } from './TimedQueue';

type IncomingMessage = MessageOrMessageBatch<MessageSubscribe | MessageUnsubscribe | MessageNotification>;
type OutgoingMessage = MessageOrMessageBatch<MessageData | MessageComplete | MessageError>;

export interface JsonRxServerParams<Ctx = unknown> {
  /**
   * Method to be called by server when it wants to send a message to the client.
   * This is usually your WebSocket "send" method.
   */
  send: (message: OutgoingMessage) => void;

  /**
   * Callback called on the server when user sends a subscription message.
   */
  call: (name: string, payload: unknown, ctx: Ctx) => Promise<unknown> | Observable<unknown> | Promise<Observable<unknown>>;

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

export class JsonRxServer<Ctx = unknown> {
  private send: (message: OutgoingMessage) => void;
  private call: JsonRxServerParams<Ctx>['call'];
  private notify: JsonRxServerParams<Ctx>['notify'];
  private readonly active = new Map<number, Subscription>();
  private readonly maxActiveSubscriptions: number;
  private readonly buffer?: TimedQueue<OutgoingMessage>;

  constructor({send, call, notify, maxActiveSubscriptions = 30, bufferSize = 10, bufferTime = 1}: JsonRxServerParams<Ctx>) {
    this.call = call;
    this.notify = notify;
    this.maxActiveSubscriptions = maxActiveSubscriptions;
    if (bufferTime) {
      const buffer = this.buffer = new TimedQueue();
      buffer.itemLimit = bufferSize;
      buffer.timeLimit = bufferTime;
      buffer.onFlush = (messages) => {
        send(messages.length === 1 ? messages[0] : messages as OutgoingMessage);
      };
      this.send = message => buffer.push(message);
    } else {
      this.send = send;
    }
  }

  private sendError(id: number, error: unknown): void {
    const message: MessageError = [-1, id, error];
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
        const message: MessageError = [-1, id, {message: 'ID already active.'}];
        this.send(message);
        return;
      }
      if (this.active.size >= this.maxActiveSubscriptions)
        return this.sendError(id, {message: 'Too many subscriptions.'});
      const callResult = this.call(name, payload, ctx);
      const observable = isObservable(callResult)
        ? callResult
        : from(callResult).pipe(
          mergeMap(value => isObservable(value) ? value : of(value)),
        );
      const ref: {buffer: unknown[]} = {buffer: []};
      let done = false;
      const subscription = observable.subscribe(
        (data: unknown) => {
          if (data === undefined) return;
          ref.buffer.push(data);
          microtask(() => {
            if (!ref.buffer.length) return;
            try {
              for (const payload of ref.buffer) this.send([-2, id, payload]);
            } finally {
              ref.buffer = [];
            }
          });
        },
        (error: unknown) => {
          done = true;
          this.active.delete(id);
          const data = error instanceof Error ? {message: error.message} : error;
          const message: MessageError = [-1, id, data];
          this.send(message);
        },
        () => {
          done = true;
          this.active.delete(id);
          try {
            if (!ref.buffer.length) return this.send(([0, id] as unknown) as OutgoingMessage);
            const last = ref.buffer.length - 1;
            for (let i = 0; i <= last; i++) {
              const isLast = i === last;
              const message: MessageComplete | MessageData = isLast ? [0, id, ref.buffer[i]] : [-2, id, ref.buffer[i]];
              this.send(message as OutgoingMessage);
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
    this.send = (message: OutgoingMessage) => {};
    for (const sub of this.active.values()) {
      sub.unsubscribe();
    }
  }
}
