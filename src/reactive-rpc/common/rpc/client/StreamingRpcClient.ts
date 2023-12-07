import {firstValueFrom, isObservable, Observable, Observer, Subject} from 'rxjs';
import * as msg from '../../messages';
import {subscribeCompleteObserver} from '../../util/subscribeCompleteObserver';
import {TimedQueue} from '../../util/TimedQueue';
import {RpcValue} from '../../messages/Value';
import type {RpcClient} from './types';

/**
 * Configuration parameters for {@link StreamingRpcClient}.
 */
export interface StreamingRpcClientOptions {
  /**
   * Method to be called by client when it wants to send messages to the server.
   * This is usually connected to your WebSocket "send" method.
   */
  send: (messages: msg.ReactiveRpcClientMessage[]) => void;

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
  /* In-between observable for request stream. */
  req$: Subject<unknown>;
  /* In-between observable for response stream. */
  res$: Subject<unknown>;
  /** Whether response stream was finalized by server. */
  resFinalized?: boolean;
}

/**
 * Implements client-side part of Reactive-RPC protocol.
 *
 * ## Usage
 *
 * Connect RPC client to WebSocket:
 *
 * ```ts
 * const client = new RpcClient({
 *   send: (messages) => ws.send(serialize(messages)),
 * });
 * ws.on('message', (event) => {
 *   client.onMessages(deserialize(event.data));
 * });
 * ```
 *
 * Send notifications to the server:
 *
 * ```ts
 * client.notify(method, payload);
 * ```
 *
 * Execute RPC methods with streaming support:
 *
 * ```ts
 * client.call(method, data$).subscribe((value) => {
 *   // ...
 * });
 * ```
 */
export class StreamingRpcClient implements RpcClient {
  private id: number = 1;
  public readonly buffer: TimedQueue<msg.ReactiveRpcClientMessage>;

  /**
   * In-flight RPC calls.
   */
  private readonly calls = new Map<number, ObserverEntry>();

  constructor({send, bufferSize = 100, bufferTime = 10}: StreamingRpcClientOptions) {
    this.buffer = new TimedQueue();
    this.buffer.itemLimit = bufferSize;
    this.buffer.timeLimit = bufferTime;
    this.buffer.onFlush = send;
  }

  /**
   * Returns the number of active in-flight calls. Useful for reporting and
   * testing for memory leaks in unit tests.
   *
   * @returns Number of in-flight RPC calls.
   */
  public getInflightCallCount(): number {
    return this.calls.size;
  }

  /**
   * Processes a batch of messages received from the server.
   *
   * @param messages List of messages from server.
   */
  public onMessages(messages: msg.ReactiveRpcServerMessage[]): void {
    const length = messages.length;
    for (let i = 0; i < length; i++) this.onMessage(messages[i]);
  }

  /**
   * Processes a message received from the server.
   *
   * @param messages A message from the server.
   */
  public onMessage(message: msg.ReactiveRpcServerMessage): void {
    if (message instanceof msg.ResponseCompleteMessage) return this.onResponseComplete(message);
    else if (message instanceof msg.ResponseDataMessage) return this.onResponseData(message);
    else if (message instanceof msg.ResponseErrorMessage) return this.onResponseError(message);
    // else if (message instanceof RequestUnsubscribeMessage) return this.onRequestUnsubscribe(message);
    return this.onRequestUnsubscribe(message);
  }

  public onResponseComplete(message: msg.ResponseCompleteMessage): void {
    const {id, value} = message;
    const call = this.calls.get(id);
    if (!call) return;
    call.resFinalized = true;
    const data = value ? value.data : undefined;
    if (data !== undefined) call.res$.next(data);
    call.res$.complete();
  }

  public onResponseData(message: msg.ResponseDataMessage): void {
    const {id, value} = message;
    const call = this.calls.get(id);
    if (!call) return;
    call.res$.next(value.data);
  }

  public onResponseError(message: msg.ResponseErrorMessage): void {
    const {id, value} = message;
    const call = this.calls.get(id);
    if (!call) return;
    call.resFinalized = true;
    call.res$.error(value.data);
  }

  public onRequestUnsubscribe(message: msg.RequestUnsubscribeMessage): void {
    const {id} = message;
    const call = this.calls.get(id);
    if (!call) return;
    call.req$.complete();
  }

  /**
   * Execute remote RPC method. We use in-between `req$` and `res$` observables.
   *
   * ```
   * +--------+      +--------+
   * |  data  |  ->  |  req$  |  ->  Server messages
   * +--------+      +--------+
   *
   *                      +--------+      +-------------------+
   * Server messages  ->  |  res$  |  ->  |  user observable  |
   *                      +--------+      +-------------------+
   * ```
   *
   * @param method RPC method name.
   * @param data RPC method static payload or stream of data.
   */
  public call$(method: string, data: unknown): Observable<unknown>;
  public call$(method: string, data: Observable<unknown>): Observable<unknown>;
  public call$(method: string, data: unknown | Observable<unknown>): Observable<unknown> {
    const id = this.id++;
    if (this.id >= 0xffff) this.id = 1;
    if (this.calls.has(id)) return this.call$(method, data as any);
    const req$ = new Subject<unknown>();
    const res$ = new Subject<unknown>();
    let finalizedStreams = 0;
    const cleanup = () => {
      finalizedStreams++;
      if (finalizedStreams === 2) this.calls.delete(id);
    };
    res$.subscribe({error: cleanup, complete: cleanup});
    const entry: ObserverEntry = {req$, res$};
    this.calls.set(id, entry);
    if (isObservable(data)) {
      let firstMessageSent = false;
      subscribeCompleteObserver<unknown>(req$, {
        next: (value) => {
          const messageMethod = firstMessageSent ? '' : method;
          firstMessageSent = true;
          const message = new msg.RequestDataMessage(id, messageMethod, new RpcValue(value, undefined));
          this.buffer.push(message);
        },
        error: (error) => {
          cleanup();
          const messageMethod = firstMessageSent ? '' : method;
          const message = new msg.RequestErrorMessage(id, messageMethod, new RpcValue(error, undefined));
          this.buffer.push(message);
        },
        complete: (value) => {
          cleanup();
          const messageMethod = firstMessageSent ? '' : method;
          const message = new msg.RequestCompleteMessage(id, messageMethod, new RpcValue(value, undefined));
          this.buffer.push(message);
        },
      });
      data.subscribe(req$);
    } else {
      this.buffer.push(new msg.RequestCompleteMessage(id, method, new RpcValue(data, undefined)));
      req$.complete();
      cleanup();
    }
    return new Observable<unknown>((observer: Observer<unknown>) => {
      res$.subscribe(observer);
      return () => {
        if (!entry.resFinalized) this.buffer.push(new msg.ResponseUnsubscribeMessage(id));
        res$.complete();
      };
    });
  }

  public async call(method: string, request: unknown): Promise<unknown> {
    return await firstValueFrom(this.call$(method, request));
  }

  /**
   * Send a one-way notification message without expecting any response.
   *
   * @param method Remote method name.
   * @param data Static payload data.
   */
  public notify(method: string, data: undefined | unknown): void {
    const value = new RpcValue(data, undefined);
    this.buffer.push(new msg.NotificationMessage(method, value));
  }

  /**
   * Stop all in-flight RPC calls and disable buffer. This operation is not
   * reversible, you cannot use the RPC client after this call.
   */
  public stop(reason: string = 'STOP'): void {
    this.buffer.onFlush = (message) => {};
    for (const call of this.calls.values()) {
      call.req$.error(new Error(reason));
      call.req$.error(new Error(reason));
    }
    this.calls.clear();
  }

  public disconnect() {
    this.stop('DISCONNECT');
  }
}
