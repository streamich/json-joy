import {Message, MessageSubscribe, MessageError, MessageData, MessageComplete, MessageNotification} from './types';
import {Observable, Observer} from 'rxjs';
import {assertId, isArray} from './util';

export interface JsonRxClientParams {
  send: (message: Message) => void;
}

interface ObserverEntry {
  observer: Observer<unknown>;
  completed?: boolean;
}

export class JsonRxClient {
  private send: (message: Message) => void;
  private cnt: number = 1;

  private readonly observers = new Map<number, ObserverEntry>();

  constructor({send}: JsonRxClientParams) {
    this.send = send;
  }

  private sendSubscribe(message: MessageSubscribe): void {
    this.send(message);
  }

  private sendUnsubscribe(id: number): void {
    this.send([-3, id]);
  }

  private onData(message: MessageData): void {
    const [, id, payload] = message;
    assertId(id);
    const observer = this.observers.get(id);
    if (!observer) return;
    observer.observer.next(payload);
  }

  private onComplete(message: MessageComplete): void {
    const [, id, payload] = message;
    assertId(id);
    const observer = this.observers.get(id);
    if (!observer) return;
    observer.completed = true;
    if (payload !== undefined) observer.observer.next(payload);
    observer.observer.complete();
  }

  private onError(message: MessageError): void {
    const [, id, error] = message;
    assertId(id);
    const observer = this.observers.get(id);
    if (!observer) return;
    observer.observer.error(error);
  }

  public onMessage(message: MessageData | MessageComplete | MessageError): void {
    if (!isArray(message)) throw new Error('Invalid message');
    const [type] = message;
    if (type === 0) return this.onComplete(message as MessageComplete);
    if (type === -1) return this.onError(message as MessageError);
    if (type === -2) return this.onData(message as MessageData);
    throw new Error('Invalid message');
  }

  public call(method: string, payload: unknown): Observable<unknown> {
    const id = this.cnt++;
    const observable = new Observable<unknown>((observer: Observer<unknown>) => {
      const entry: ObserverEntry = {observer};
      this.observers.set(id, entry);
      return () => {
        this.observers.delete(id);
        if (!entry.completed) this.sendUnsubscribe(id);
      };
    });
    this.sendSubscribe([id, method, payload]);
    return observable;
  }

  public notify(name: string, payload?: unknown): void {
    const message: MessageNotification = payload !== undefined ? [name, payload] : [name];
    this.send(message);
  }

  public stop(): void {
    this.send = (message: Message) => {};
    for (const {observer} of this.observers.values())
      observer.complete();
  }
}
