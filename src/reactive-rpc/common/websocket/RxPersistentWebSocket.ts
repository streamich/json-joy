import {BehaviorSubject, from, Observable, ReplaySubject, Subject, merge} from 'rxjs';
import {delay, filter, map, switchMap, take, takeUntil, tap} from 'rxjs/operators';
import {RxWebSocket, RxWebSocketParams} from './RxWebSocket';

type Data = string | ArrayBufferLike | Blob | ArrayBufferView;

export interface RxPersistentWebSocketParams extends RxWebSocketParams {
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

  /**
   * Start the persistent WebSocket, when this observable emits. If not provided,
   * will start the socket immediately.
   */
  start$?: Observable<unknown>;

  /**
   * Stop the current connection and all reconnection attempts, when this
   * observable emits. If not provided, will never stop the socket.
   */
  stop$?: Observable<unknown>;
}

/**
 * WebSocket which automatically reconnects if disconnected.
 */
export class RxPersistentWebSocket {
  /** Currently used RxWebSocket or last active RxWebSocket. */
  public readonly ws$ = new ReplaySubject<RxWebSocket>(1);
  
  /** Emits incoming messages. */
  public readonly message$ = this.ws$.pipe(switchMap(ws => ws.message$));

  // public readonly error$ = this.ws$.pipe(switchMap(ws => ws.error$));

  public readonly connected$ = new BehaviorSubject<boolean>(false);

  /** Number of times we have attempted to reconnect. */
  protected retries = 0;

  constructor(public readonly params: RxPersistentWebSocketParams) {
    const start$ = params.start$ || from((async () => undefined)());
    const stop$ = params.stop$ || new Subject();

    // Create new WebSocket when service starts.
    start$
      .subscribe(() => this.ws$.next(new RxWebSocket(params)));

    // Re-connect, when WebSocket closes.
    start$
      .pipe(
        switchMap(() => this.ws$),
        switchMap(ws => ws.close$),
        takeUntil(stop$),
        delay(this.reconnectDelay()),
        takeUntil(stop$),
        tap(() => this.ws$.next(new RxWebSocket(this.params))),
        delay(params.minUptime || 5_000),
        takeUntil(stop$),
        tap(() => this.retries = 0),
      )
      .subscribe();

    // Track if socket is connected.
    start$
      .pipe(
        switchMap(() => this.ws$),
        switchMap(ws => merge([ws.open$, ws.close$, ws.error$])),
        switchMap(() => this.ws$),
        map(ws => ws.isOpen()),
      )
      .subscribe(this.connected$);

    // Reset re-try counter when service stops.
    stop$.subscribe(() => {
      this.retries = 0;
    });
  }

  public reconnectDelay(): number {
    if (this.retries <= 0) return 0;
    const minReconnectionDelay = this.params.minReconnectionDelay || Math.round(1_000 + Math.random() * 1_000);
    const maxReconnectionDelay = this.params.maxReconnectionDelay || 10_000;
    const reconnectionDelayGrowFactor = this.params.reconnectionDelayGrowFactor || 1.3;
    const delay = Math.min(maxReconnectionDelay, minReconnectionDelay * (reconnectionDelayGrowFactor ** (this.retries - 1)))
    return delay;
  }

  public send$(data: Data): Observable<number> {
    return this.ws$
      .pipe(
        switchMap(ws => ws.open$),
        filter(ws => ws.isOpen()),
        take(1),
        map(ws => ws.send(data)),
      );
  }
}
