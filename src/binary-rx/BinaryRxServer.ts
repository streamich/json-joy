import {NotificationMessage, SubscribeMessage, DataMessage, CompleteMessage, UnsubscribeMessage, ErrorMessage} from './messages';
import {Subscription, Observable, from, isObservable, of} from 'rxjs';
import {mergeMap} from 'rxjs/operators';
import {TimedQueue} from '../json-rx/TimedQueue';
import {decodeCompleteMessages, Encoder} from './codec';
import {assertName, microtask} from '../json-rx/util';

type IncomingMessage = SubscribeMessage | UnsubscribeMessage | NotificationMessage;
type OutgoingMessage = DataMessage | CompleteMessage | ErrorMessage;

const ERR_UNKNOWN = new Uint8Array([0]);
const ERR_ID_TAKEN = new Uint8Array([1]);
const ERR_TOO_MANY_SUBSCRIPTIONS = new Uint8Array([2]);

export interface BinaryRxServerParams<Ctx = unknown> {
  /**
   * Method to be called by server when it wants to send a message to the client.
   * This is usually your WebSocket "send" method.
   */
  send: (message: Uint8Array) => void;

  /**
   * Callback called on the server when user sends a subscription message.
   */
  call: (name: string, data: Uint8Array | undefined, ctx: Ctx) => Promise<Uint8Array | Observable<Uint8Array> | Promise<Observable<Uint8Array>>>;

  /**
   * Callback called on the server when user sends a notification message.
   */
  notify: (name: string, data: Uint8Array | undefined, ctx: Ctx) => void;

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

export class BinaryRxServer<Ctx = unknown> {
  private send: (message: OutgoingMessage) => void;
  private call: BinaryRxServerParams<Ctx>['call'];
  private notify: BinaryRxServerParams<Ctx>['notify'];
  private readonly active = new Map<number, Subscription>();
  private readonly maxActiveSubscriptions: number;
  private encoder = new Encoder();

  constructor({send, call, notify, maxActiveSubscriptions = 30, bufferSize = 10, bufferTime = 1}: BinaryRxServerParams<Ctx>) {
    this.call = call;
    this.notify = notify;
    this.maxActiveSubscriptions = maxActiveSubscriptions;
    if (bufferTime) {
      const buffer = new TimedQueue<OutgoingMessage>();
      buffer.itemLimit = bufferSize;
      buffer.timeLimit = bufferTime;
      buffer.onFlush = (messages) => {
        send(this.encoder.encode(messages));
      };
      this.send = message => buffer.push(message);
    } else {
      this.send = (message) => {
        send(this.encoder.encode([message]));
      };
    }
  }

  private sendError(id: number, data: Uint8Array): void {
    this.send(new ErrorMessage(id, data));
  }

  private onSubscribe(message: SubscribeMessage, ctx: Ctx): void {
    const {id, method, data} = message;
    assertName(method);
    try {
      const active = this.active.get(id);
      if (active) {
        this.active.delete(id);
        active.unsubscribe();
        this.sendError(id, ERR_ID_TAKEN);
        return;
      }
      if (this.active.size >= this.maxActiveSubscriptions)
        return this.sendError(id, ERR_TOO_MANY_SUBSCRIPTIONS);
      const callResult = this.call(method, data, ctx);
      const observable: Observable<Uint8Array> = (isObservable(callResult)
        ? callResult
        : from(callResult).pipe(
          mergeMap(value => isObservable(value) ? value : of(value)),
        )) as Observable<Uint8Array>;
      const ref: {buffer: Uint8Array[]} = {buffer: []};
      let done = false;
      const subscription = observable.subscribe(
        (data: Uint8Array) => {
          if (data === undefined) return;
          ref.buffer.push(data);
          microtask(() => {
            if (!ref.buffer.length) return;
            try {
              for (const payload of ref.buffer)
                this.send(new DataMessage(id, payload));
            } finally {
              ref.buffer = [];
            }
          });
        },
        (error: unknown) => {
          done = true;
          this.active.delete(id);
          this.sendError(id, Buffer.isBuffer(error) ? error : ERR_UNKNOWN);
        },
        () => {
          done = true;
          this.active.delete(id);
          try {
            if (!ref.buffer.length) return this.send(new CompleteMessage(id, undefined));
            const last = ref.buffer.length - 1;
            for (let i = 0; i <= last; i++) {
              const isLast = i === last;
              const message: CompleteMessage | DataMessage = isLast
                ? new CompleteMessage(id, ref.buffer[i])
                : new DataMessage(id, ref.buffer[i]);
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

  private onUnsubscribe(message: UnsubscribeMessage): void {
    const {id} = message;
    const subscription = this.active.get(id);
    if (!subscription) return;
    this.active.delete(id);
    subscription.unsubscribe();
  }

  private onNotification(message: NotificationMessage, ctx: Ctx): void {
    const {method, data} = message;
    assertName(method);
    this.notify(method, data, ctx);
  }

  public onArray(arr: Uint8Array, ctx: Ctx): void {
    const messages = decodeCompleteMessages(arr, 0);
    this.onMessages(messages as IncomingMessage[], ctx);
  }

  public onMessages(messages: IncomingMessage[], ctx: Ctx): void {
    const length = messages.length;
    for (let i = 0; i < length; i++) {
      const message = messages[i];
      if (message instanceof NotificationMessage) this.onNotification(message, ctx);
      else if (message instanceof SubscribeMessage) this.onSubscribe(message, ctx);
      else if (message instanceof UnsubscribeMessage) this.onUnsubscribe(message);
    }
  }

  public stop() {
    this.send = (message: OutgoingMessage) => {};
    for (const sub of this.active.values()) {
      sub.unsubscribe();
    }
  }
}
