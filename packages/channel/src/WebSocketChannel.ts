import {Subject, ReplaySubject, BehaviorSubject, type Observable, map} from 'rxjs';
import {toUint8Array} from '@jsonjoy.com/buffers/lib/toUint8Array';
import {ChannelState} from './constants';
import type {CloseEventBase, PhysicalChannel} from './types';

export type WebSocketBase = Pick<
  WebSocket,
  'binaryType' | 'readyState' | 'bufferedAmount' | 'onopen' | 'onclose' | 'onerror' | 'onmessage' | 'close' | 'send'
>;

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
export class WebSocketChannel<T extends string | Uint8Array = string | Uint8Array> implements PhysicalChannel<T> {
  /**
   * Native WebSocket reference, or `undefined` if construction of WebSocket
   * failed.
   */
  public readonly ws: WebSocketBase | undefined;

  public readonly state$ = new BehaviorSubject<ChannelState>(ChannelState.CONNECTING);
  public readonly open$ = new ReplaySubject<PhysicalChannel>(1);
  public readonly close$ = new ReplaySubject<[self: PhysicalChannel, event: CloseEventBase]>(1);
  public readonly error$ = new Subject<Error>();
  public readonly message$ = new Subject<T>();

  constructor({newSocket}: WebSocketChannelParams) {
    try {
      const ws = (this.ws = newSocket());
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
        const error: Error =
          errorEvent.error instanceof Error ? errorEvent.error : new Error(String(errorEvent.message || 'ERROR'));
        this.error$.next(error);
      };
      ws.onmessage = (event) => {
        const data = event.data;
        const message: T = (typeof data === 'string' ? data : toUint8Array(data)) as unknown as T;
        this.message$.next(message);
      };
    } catch (error) {
      this.state$.next(ChannelState.CLOSED);
      this.error$.next(error as Error);
      this.close$.next([this, {code: 0, wasClean: true, reason: 'INIT'}]);
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
    return this.open$.pipe(
      map(() => {
        if (!this.isOpen()) throw new Error('CLOSED');
        return this.send(data);
      }),
    );
  }
}
