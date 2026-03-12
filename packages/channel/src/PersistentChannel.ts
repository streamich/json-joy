import {Subject, BehaviorSubject, type Observable, type Subscription, from} from 'rxjs';
import {delay, filter, map, skip, switchMap, take, takeUntil, tap} from 'rxjs/operators';
import {ChannelState} from './constants';
import type {PhysicalChannel} from './types';

export interface PersistentChannelParams<T extends string | Uint8Array = string | Uint8Array> {
  /**
   * New `Channel` factory.
   */
  newChannel: () => PhysicalChannel<T>;

  /**
   * Minimum amount of time in ms to wait before attempting to reconnect.
   * Defaults to 1,500 +/- 500 milliseconds.
   */
  minReconnectionDelay?: number;

  /**
   * Maximum amount of time in ms to wait before attempting to reconnect.
   * Defaults to 10,000 milliseconds.
   */
  maxReconnectionDelay?: number;

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
  minUptime?: number;
}

/**
 * Channel which automatically reconnects if disconnected. Once stopped via
 * `.stop()`, the instance is fully disposed and cannot be restarted.
 */
export class PersistentChannel<T extends string | Uint8Array = string | Uint8Array> {
  /**
   * Whether the service is "active". The service becomes active when it is
   * started using the ".start()" method. When service is "active" it will
   * attempt to always keep an open channel connected.
   */
  public readonly active$ = new BehaviorSubject(false);

  /**
   * Currently used channel, if any. When service is "active" it attempts to
   * create and open a channel.
   */
  public readonly channel$ = new BehaviorSubject<undefined | PhysicalChannel<T>>(undefined);

  /**
   * Whether the currently active channel (if any) is "open". An open channel
   * is one where communication can happen, where a message can be sent to the
   * other side.
   */
  public readonly open$ = new BehaviorSubject<boolean>(false);

  /** Emits incoming messages. */
  public readonly message$ = this.channel$.pipe(
    filter((channel) => !!channel),
    switchMap((channel) => channel!.message$),
  );

  /** Emits errors from channel factory or underlying channels. */
  public readonly error$ = new Subject<Error>();

  /** Number of times we have attempted to reconnect. */
  protected retries = 0;

  private readonly subs: Subscription[] = [];
  private readonly stop$ = new Subject<void>();

  constructor(public readonly params: PersistentChannelParams<T>) {
    const start$ = new Subject<void>();

    this.subs.push(
      this.active$
        .pipe(
          skip(1),
          filter((active) => active),
        )
        .subscribe(() => {
          start$.next(undefined);
        }),
    );

    this.subs.push(
      this.active$
        .pipe(
          skip(1),
          filter((active) => !active),
        )
        .subscribe(() => {
          this.stop$.next(undefined);
        }),
    );

    // Create new channel when service starts.
    this.subs.push(
      start$.subscribe(() => {
        this.createChannel();
      }),
    );

    // Re-connect, when channel closes.
    this.subs.push(
      start$
        .pipe(
          switchMap(() => this.channel$),
          filter((channel) => !!channel),
          takeUntil(this.stop$),
          switchMap((channel) => channel!.close$),
          takeUntil(this.stop$),
          switchMap(() =>
            from(
              (async () => {
                const timeout = this.reconnectDelay();
                this.retries++;
                await new Promise((resolve) => setTimeout(resolve, timeout));
              })(),
            ),
          ),
          takeUntil(this.stop$),
          tap(() => this.createChannel()),
          delay(params.minUptime || 5_000),
          takeUntil(this.stop$),
          tap(() => {
            const isOpen = this.channel$.getValue()?.isOpen();
            if (isOpen) {
              this.retries = 0;
            }
          }),
        )
        .subscribe(),
    );

    // Track if channel is connected.
    this.subs.push(
      start$
        .pipe(
          switchMap(() => this.channel$),
          filter((channel) => !!channel),
          switchMap((channel) => channel!.state$),
          map((state) => state === ChannelState.OPEN),
        )
        .subscribe((open) => {
          if (open !== this.open$.getValue()) this.open$.next(open);
        }),
    );

    // Reset re-try counter when service stops.
    this.subs.push(
      this.stop$.subscribe(() => {
        this.retries = 0;
      }),
    );
  }

  private createChannel(): void {
    try {
      this.channel$.next(this.params.newChannel());
    } catch (error) {
      this.error$.next(error instanceof Error ? error : new Error(String(error)));
    }
  }

  public start(): void {
    if (this.active$.getValue()) return;
    this.active$.next(true);
  }

  public stop(): void {
    if (!this.active$.getValue()) return;
    this.active$.next(false);
    const channel = this.channel$.getValue();
    if (channel) {
      channel.close();
      this.channel$.next(undefined);
    }
    this.open$.next(false);
    for (const sub of this.subs) sub.unsubscribe();
    this.subs.length = 0;
    this.stop$.complete();
    this.error$.complete();
    this.active$.complete();
    this.channel$.complete();
    this.open$.complete();
  }

  public reconnectDelay(): number {
    if (this.retries <= 0) return 0;
    const minReconnectionDelay = this.params.minReconnectionDelay || Math.round(1_000 + Math.random() * 1_000);
    const maxReconnectionDelay = this.params.maxReconnectionDelay || 10_000;
    const reconnectionDelayGrowFactor = this.params.reconnectionDelayGrowFactor || 1.3;
    const delay = Math.min(
      maxReconnectionDelay,
      minReconnectionDelay * reconnectionDelayGrowFactor ** (this.retries - 1),
    );
    return delay;
  }

  public send$(data: T): Observable<number> {
    return this.channel$.pipe(
      filter((channel) => !!channel),
      switchMap((channel) => channel!.open$),
      filter((channel) => channel.isOpen()),
      take(1),
      map((channel) => {
        const canSend = this.active$.getValue() && this.open$.getValue();
        return canSend ? channel.send(data) : -1;
      }),
    );
  }
}
