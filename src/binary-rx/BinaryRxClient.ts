import {
  NotificationMessage,
  SubscribeMessage,
  DataMessage,
  CompleteMessage,
  UnsubscribeMessage,
  ErrorMessage,
} from './messages';
import {Observable, Observer} from 'rxjs';
import {TimedQueue} from '../json-rx/TimedQueue';
import {decodeFullMessages, Encoder} from './codec';

type IncomingMessage = DataMessage | CompleteMessage | ErrorMessage;
type OutgoingMessage = SubscribeMessage | UnsubscribeMessage | NotificationMessage;

export interface BinaryRxClientParams {
  /**
   * Method to be called by client when it wants to send a message to the server.
   * This is usually your WebSocket "send" method.
   */
  send: (message: Uint8Array) => void;

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
  observer: Observer<Uint8Array>;
  completed?: boolean;
}

export class BinaryRxClient {
  private id: number = 1;
  private readonly buffer: TimedQueue<OutgoingMessage>;
  private encoder = new Encoder();

  private readonly observers = new Map<number, ObserverEntry>();

  constructor({send, bufferSize = 100, bufferTime = 10}: BinaryRxClientParams) {
    this.buffer = new TimedQueue();
    this.buffer.itemLimit = bufferSize;
    this.buffer.timeLimit = bufferTime;
    this.buffer.onFlush = (messages) => {
      send(this.encoder.encode(messages));
    };
  }

  private sendSubscribe(id: number, method: string, data: undefined | Uint8Array): void {
    const message = new SubscribeMessage(id, method, data);
    this.buffer.push(message);
  }

  private sendUnsubscribe(id: number): void {
    this.buffer.push(new UnsubscribeMessage(id));
  }

  private onData(message: DataMessage): void {
    const {id, data} = message;
    const observer = this.observers.get(id);
    if (!observer) return;
    observer.observer.next(data);
  }

  private onComplete(message: CompleteMessage): void {
    const {id, data} = message;
    const observer = this.observers.get(id);
    if (!observer) return;
    observer.completed = true;
    if (data && data.byteLength) observer.observer.next(data);
    observer.observer.complete();
  }

  private onError(message: ErrorMessage): void {
    const {id, data} = message;
    const observer = this.observers.get(id);
    if (!observer) return;
    observer.completed = true;
    observer.observer.error(data);
  }

  public onArray(arr: Uint8Array): void {
    const messages = decodeFullMessages(arr, 0);
    this.onMessages(messages as IncomingMessage[]);
  }

  public onMessages(messages: IncomingMessage[]): void {
    const length = messages.length;
    for (let i = 0; i < length; i++) {
      const message = messages[i];
      if (message instanceof CompleteMessage) this.onComplete(message);
      else if (message instanceof DataMessage) this.onData(message);
      else if (message instanceof ErrorMessage) this.onError(message);
    }
  }

  public call(method: string, data: Uint8Array): Observable<unknown> {
    const id = this.id++;
    if (this.id >= 0xffff) this.id = 1;
    if (this.observers.has(id)) return this.call(method, data);
    const observable = new Observable<unknown>((observer: Observer<unknown>) => {
      const entry: ObserverEntry = {observer};
      this.observers.set(id, entry);
      return () => {
        this.observers.delete(id);
        if (!entry.completed) this.sendUnsubscribe(id);
      };
    });
    this.sendSubscribe(id, method, data);
    return observable;
  }

  public notify(method: string, data: undefined | Uint8Array): void {
    const message = new NotificationMessage(method, data);
    this.buffer.push(message);
  }

  public stop(): void {
    this.buffer.onFlush = (message) => {};
    for (const {observer} of this.observers.values()) observer.complete();
  }
}
