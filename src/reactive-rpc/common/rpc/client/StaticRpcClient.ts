import * as msg from '../../messages';
import {TimedQueue} from '../../util/TimedQueue';
import {Value} from '../../messages/Value';
import {Defer} from '../../../../util/Defer';
import {Observable, of, switchMap} from 'rxjs';
import type {RpcClient} from './types';

/**
 * Configuration parameters for {@link StaticRpcClient}.
 */
export interface StaticRpcClientOptions {
  /**
   * Method to be called by client when it wants to send messages to the server.
   * This is usually connected to your WebSocket "send" method.
   */
  send?: (messages: msg.ReactiveRpcClientMessage[]) => Promise<msg.ReactiveRpcServerMessage[]>;

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

export class StaticRpcClient implements RpcClient {
  private id: number = 1;
  public readonly buffer: TimedQueue<msg.ReactiveRpcClientMessage>;
  public onsend: (messages: msg.ReactiveRpcClientMessage[]) => Promise<msg.ReactiveRpcServerMessage[]> = async () => {
    throw new Error('onsend not implemented');
  };

  /**
   * In-flight RPC calls.
   */
  private readonly calls = new Map<number, Defer<unknown>>();

  constructor({send, bufferSize = 100, bufferTime = 10}: StaticRpcClientOptions) {
    if (send) this.onsend = send;
    this.buffer = new TimedQueue();
    this.buffer.itemLimit = bufferSize;
    this.buffer.timeLimit = bufferTime;
    this.buffer.onFlush = (messages: msg.ReactiveRpcClientMessage[]) => {
      this.onsend(messages)
        .then((responses: msg.ReactiveRpcServerMessage[]) => {
          for (const response of responses) {
            const id = response.id;
            const calls = this.calls;
            const future = calls.get(id);
            calls.delete(id);
            if (!future) continue;
            if (response instanceof msg.ResponseCompleteMessage) future.resolve(response.value?.data);
            else if (response instanceof msg.ResponseErrorMessage) future.reject(response.value?.data);
          }
        })
        .catch((error) => {
          for (const message of messages)
            if (message instanceof msg.RequestCompleteMessage) {
              const id = message.id;
              const calls = this.calls;
              const future = calls.get(id);
              calls.delete(id);
              if (!future) continue;
              future.reject(error);
            }
        })
        .finally(() => {
          for (const message of messages)
            if (message instanceof msg.RequestCompleteMessage) this.calls.delete(message.id);
        });
    };
  }

  public call$(method: string, data: unknown | Observable<unknown>): Observable<unknown> {
    return (data instanceof Observable ? data : of(data)).pipe(switchMap((data) => this.call(method, data)));
  }

  public async call(method: string, request: unknown): Promise<unknown> {
    const id = this.id;
    this.id = (id + 1) % 0xffff;
    const value = new Value(request, undefined);
    const message = new msg.RequestCompleteMessage(id, method, value);
    const future = new Defer<unknown>();
    this.calls.set(id, future);
    this.buffer.push(message);
    return await future.promise;
  }

  public notify(method: string, data: undefined | unknown): void {
    const value = new Value(data, undefined);
    this.buffer.push(new msg.NotificationMessage(method, value));
  }

  public stop() {}
}
