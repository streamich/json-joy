import type {WebSocketBase, CloseEventBase} from './types';
import {Subject, ReplaySubject, BehaviorSubject, Observable, from, merge} from 'rxjs';
import {toUint8Array} from '../../../util/toUint8Array';
import {delay, filter, map, switchMap, take, takeUntil, tap} from 'rxjs/operators';

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
   * Whether the channel currently is open.
   */
  isOpen(): boolean;

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
        this.state$.next(ChannelState.OPEN);
        this.open$.next(this);
        this.open$.complete();
      };
      ws.onclose = (event) => {
        this.state$.next(ChannelState.CLOSED);
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

export interface PersistentChannelParams<T extends string | Uint8Array = string | Uint8Array> {
  /**
   * New `Channel` factory.
   */
  newChannel: () => Channel<T>;

  /**
   * Minimum amount of time in ms to wait before attempting to reconnect.
   * Defaults to 1,500 +/- 500 milliseconds.
   */
  minReconnectionDelay?: number,

  /**
   * Maximum amount of time in ms to wait before attempting to reconnect.
   * Defaults to 10,000 milliseconds.
   */
  maxReconnectionDelay?: number,

  /**
   * Factor which is raised to the power of number of retry attempts and
   * subsequently multiplied the `minReconnectionDelay` to get to current
   * reconnection delay.
   */
  reconnectionDelayGrowFactor?: number;

  /**
   * Minimum time the WebSocket should be open to reset retry counter.
   * Defaults to 5,000 milliseconds.
   */
  minUptime?: number,
}

/**
 * Channel which automatically reconnects if disconnected.
 */
export class PersistentChannel<T extends string | Uint8Array = string | Uint8Array> {
  public readonly active$ = new BehaviorSubject(false);

  /** Currently used channel. */
  public readonly channel$ = new ReplaySubject<Channel<T>>(1);
  
  /** Emits incoming messages. */
  public readonly message$ = this.channel$.pipe(switchMap(ws => ws.message$));

  // public readonly error$ = this.ws$.pipe(switchMap(ws => ws.error$));

  public readonly open$ = new BehaviorSubject<boolean>(false);

  /** Number of times we have attempted to reconnect. */
  protected retries = 0;

  constructor(public readonly params: PersistentChannelParams<T>) {
    const start$ = this.active$.pipe(filter(active => active));
    const stop$ = this.active$.pipe(filter(active => !active));

    // Create new Channel when service starts.
    start$
      .subscribe(() => this.channel$.next(params.newChannel()));

    // Re-connect, when Channel closes.
    start$
      .pipe(
        switchMap(() => this.channel$),
        switchMap(channel => channel.close$),
        takeUntil(stop$),
        delay(this.reconnectDelay()),
        takeUntil(stop$),
        tap(() => this.channel$.next(params.newChannel())),
        delay(params.minUptime || 5_000),
        takeUntil(stop$),
        tap(() => this.retries = 0),
      )
      .subscribe();

    // Track if Channel is connected.
    start$
      .pipe(
        switchMap(() => this.channel$),
        switchMap(channel => channel.state$),
        map(state => state === ChannelState.OPEN),
      )
      .subscribe(open => {
        if (open !== this.open$.getValue()) this.open$.next(open);
      });

    // start$
    //   .pipe(
    //     switchMap(() => stop$),
    //     switchMap(() => this.channel$),
    //   )
    //   .subscribe(channel => {
    //     console.log('STOPPING')
    //     if (channel && channel.isOpen()) channel.close();
    //   });

    // Reset re-try counter when service stops.
    stop$.subscribe(() => {
      this.retries = 0;
    });
  }

  public start(): void {
    if (this.active$.getValue()) return;
    this.active$.next(true);
  }

  public stop(): void {
    if (!this.active$.getValue()) return;
    this.active$.next(false);
  }

  public reconnectDelay(): number {
    if (this.retries <= 0) return 0;
    const minReconnectionDelay = this.params.minReconnectionDelay || Math.round(1_000 + Math.random() * 1_000);
    const maxReconnectionDelay = this.params.maxReconnectionDelay || 10_000;
    const reconnectionDelayGrowFactor = this.params.reconnectionDelayGrowFactor || 1.3;
    const delay = Math.min(maxReconnectionDelay, minReconnectionDelay * (reconnectionDelayGrowFactor ** (this.retries - 1)))
    return delay;
  }

  public send$(data: T): Observable<number> {
    return this.channel$
      .pipe(
        switchMap(channel => channel.open$),
        filter(channel => channel.isOpen()),
        take(1),
        map(channel => channel.send(data)),
      );
  }
}
