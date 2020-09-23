import {
  Message,
  MessageSubscribe,
  MessageError,
  MessageData,
  MessageNotification,
  MessageUnsubscribe,
  MessageComplete,
} from './types';
import {Subscription, Observable, from, isObservable, of} from 'rxjs';
import {mergeMap} from 'rxjs/operators';
import {assertId, assertName, isArray, microtask} from './util';

export interface JsonRxServerParams<Ctx = unknown> {
  send: (message: Message) => void;
  call: (name: string, payload: unknown, ctx: Ctx) => Promise<unknown> | Observable<unknown> | Promise<Observable<unknown>>;
  notify: (name: string, payload: unknown, ctx: Ctx) => void;
  maxActiveSubscriptions?: number;
}

export class JsonRxServer<Ctx = unknown> {
  private send: (message: Message) => void;
  private call: JsonRxServerParams<Ctx>['call'];
  private notify: JsonRxServerParams<Ctx>['notify'];
  private readonly active = new Map<number, Subscription>();
  private readonly maxActiveSubscriptions: number;

  constructor({send, call, notify, maxActiveSubscriptions = 30}: JsonRxServerParams<Ctx>) {
    this.send = send;
    this.call = call;
    this.notify = notify;
    this.maxActiveSubscriptions = maxActiveSubscriptions;
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
            if (!ref.buffer.length) return this.send(([0, id] as unknown) as Message);
            const last = ref.buffer.length - 1;
            for (let i = 0; i <= last; i++) {
              const isLast = i === last;
              const message: MessageComplete | MessageData = isLast ? [0, id, ref.buffer[i]] : [-2, id, ref.buffer[i]];
              this.send(message as Message);
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

  public onMessage(message: Message, ctx: Ctx): void {
    if (!isArray(message)) throw new Error('Invalid message');
    const [one] = message;
    if (typeof one === 'string') return this.onNotification(message as MessageNotification, ctx);
    if (one > 0) return this.onSubscribe(message as MessageSubscribe, ctx);
    if (one === -3) return this.onUnsubscribe(message as MessageUnsubscribe);
    throw new Error('Invalid message');
  }

  public stop() {
    this.send = (message: Message) => {};
    for (const sub of this.active.values()) {
      sub.unsubscribe();
    }
  }
}
