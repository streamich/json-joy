import type {WebSocketBase, CloseEventBase} from './types';
import {Subject, ReplaySubject, BehaviorSubject, Observable} from 'rxjs';
import {toUint8Array} from '../../../util/toUint8Array';
import {map} from 'rxjs/operators';

export const enum ChannelState {
  CONNECTING = 0,
  OPEN = 1,
  CLOSED = 2,
}

export interface Channel<T extends string | Uint8Array = string | Uint8Array> {
  /**
   * Emits on every new incoming message.
   */
  message$: Observable<T>;
  
  /**
   * Emits an error in channel is raised.
   */
  error$: Observable<Error>;

  /**
   * Contains the current state of the channel and emits on state every state
   * transition.
   */
  state$: BehaviorSubject<ChannelState>;

  /**
   * Emits once when channel transitions into "open" state.
   */
  open$: Observable<Channel>;

  /**
   * Emits once when channel transitions into "close" state.
   */
  close$: Observable<[self: Channel, event: CloseEventBase]>;

  /**
   * Sends an outgoing message to the channel immediately.
   * 
   * @param data A message payload.
   * @returns Number of bytes buffered or -1 if channel is not ready.
   */
  send(data: T): number;

  /**
   * Waits for the channel to connect and only then sends out the message. If
   * channel is closed, emits an error.
   * 
   * @param data A message payload.
   * @returns Number of bytes buffered.
   */
  send$(data: T): Observable<number>;

  /**
   * Closes the channel.
   * 
   * @param code Closure code.
   * @param reason Closure reason.
   */
  close(code?: number, reason?: string): void;

  /**
   * Amount of buffered outgoing messages in bytes.
   */
  buffer(): number;
}

export interface WebSocketChannelParams {
  /**
   * Should return a new WebSocket instance. The binary type of the WebSocket
   * will be automatically changed to "arraybuffer".
   */
  newSocket: () => WebSocketBase;
}

/**
 * A `Channel` interface using WebSocket implementation.
 */
export class WebSocketChannel<T extends string | Uint8Array = string | Uint8Array> implements Channel<T> {
  /**
   * Native WebSocket reference, or `undefined` if construction of WebSocket
   * failed.
   */
  public readonly ws: WebSocketBase | undefined;

  public readonly state$ = new BehaviorSubject<ChannelState>(ChannelState.CONNECTING);
  public readonly open$ = new ReplaySubject<Channel>(1);
  public readonly close$ = new ReplaySubject<[self: Channel, event: CloseEventBase]>(1);
  public readonly error$ = new Subject<Error>();
  public readonly message$ = new Subject<T>();

  constructor({newSocket}: WebSocketChannelParams) {
    try {
      const ws = this.ws = newSocket();
      ws.binaryType = 'arraybuffer';
      ws.onopen = () => {
        this.open$.next(this);
        this.open$.complete();
      };
      ws.onclose = (event) => {
        this.close$.next([this, event]);
        this.close$.complete();
        this.message$.complete();
      };
      ws.onerror = (event: Event) => {
        const errorEvent: Partial<ErrorEvent> = event as unknown as Partial<ErrorEvent>;
        const error: Error = errorEvent.error instanceof Error ? errorEvent.error : new Error(String(errorEvent.message) || 'ERROR');
        this.error$.next(error);
      };
      ws.onmessage = (event) => {
        const data = event.data;
        const message: T = (typeof data === 'string' ? data : toUint8Array(data)) as unknown as T;
        this.message$.next(message);
      };
    } catch (error) {
      this.state$.next(ChannelState.CLOSED);
      this.error$.next(error);
      this.close$.next([this, {code: 0, wasClean: true, reason: 'CONSTRUCTOR'}]);
      this.close$.complete();
    }
  }

  public buffer(): number {
    if (!this.ws) return 0;
    return this.ws.bufferedAmount;
  }

  public close(code?: number, reason?: string): void {
    if (!this.ws) return;
    this.ws.close(code, reason);
  }

  public isOpen(): boolean {
    return this.state$.getValue() === ChannelState.OPEN;
  }
  
  public send(data: T): number {
    if (!this.ws) return -1;
    const buffered = this.ws.bufferedAmount;
    this.ws.send(data);
    return this.ws.bufferedAmount - buffered;
  }
  
  public send$(data: T): Observable<number> {
    return this.open$
      .pipe(
        map(() => {
          if (!this.isOpen()) throw new Error('CLOSED');
          return this.send(data);
        }),
      );
  }
}
