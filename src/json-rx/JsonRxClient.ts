import {MessageSubscribe, MessageError, MessageData, MessageComplete, MessageNotification, MessageUnsubscribe, MessageOrMessageBatch} from './types';
import {Observable, Observer} from 'rxjs';
import {assertId, isArray} from './util';
import {TimedQueue} from './TimedQueue';

type IncomingMessage = MessageOrMessageBatch<MessageData | MessageComplete | MessageError>;
type OutgoingMessage = MessageOrMessageBatch<MessageSubscribe | MessageUnsubscribe | MessageNotification>;

export interface JsonRxClientParams {
  /**
   * Method to be called by client when it wants to send a message to the server.
   * This is usually your WebSocket "send" method.
   */
  send: (message: OutgoingMessage) => void;

  /**
   * Number of messages to keep in buffer before sending them to the server.
   * The buffer is flushed when the message reaches this limit or when the
   * buffering time has reached the time specified in `bufferTime` parameter.
   * Defaults to 100 messages.
   */
  bufferSize?: number;

  /**
   * Time in milliseconds for how long to buffer messages before sending them
   * to the server. Defaults to 10 milliseconds.
   */
  bufferTime?: number;
}

interface ObserverEntry {
  observer: Observer<unknown>;
  completed?: boolean;
}

export class JsonRxClient {
  private cnt: number = 1;
  private readonly buffer: TimedQueue<OutgoingMessage>;

  private readonly observers = new Map<number, ObserverEntry>();

  constructor({send, bufferSize = 100, bufferTime = 10}: JsonRxClientParams) {
    this.buffer = new TimedQueue();
    this.buffer.itemLimit = bufferSize;
    this.buffer.timeLimit = bufferTime;
    this.buffer.onFlush = (messages) => {
      send(messages.length === 1 ? messages[0] : messages as OutgoingMessage);
    };
  }

  private sendSubscribe(message: MessageSubscribe): void {
    // this.send(message);
    this.buffer.push(message);
  }

  private sendUnsubscribe(id: number): void {
    // this.send([-3, id]);
    this.buffer.push([-3, id]);
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
    observer.completed = true;
    observer.observer.error(error);
  }

  public onMessage(message: IncomingMessage): void {
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
    // this.send(message);
    this.buffer.push(message);
  }

  public stop(): void {
    // this.send = (message: OutgoingMessage) => {};
    this.buffer.onFlush = (message) => {};
    for (const {observer} of this.observers.values())
      observer.complete();
  }
}
