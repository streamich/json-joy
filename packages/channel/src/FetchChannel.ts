import {Subject, ReplaySubject, BehaviorSubject, type Observable, of} from 'rxjs';
import {toUint8Array} from '@jsonjoy.com/buffers/lib/toUint8Array';
import {ChannelState} from './constants';
import type {CloseEventBase, PhysicalChannel} from './types';

export interface FetchChannelParams {
  fetch: (data: Uint8Array) => Promise<Uint8Array>;
}

/**
 * A `Channel` interface using Fetch implementation.
 */
export class FetchChannel<T extends string | Uint8Array = string | Uint8Array> implements PhysicalChannel<T> {
  public readonly state$ = new BehaviorSubject<ChannelState>(ChannelState.CONNECTING);
  public readonly open$ = new ReplaySubject<PhysicalChannel>(1);
  public readonly close$ = new ReplaySubject<[self: PhysicalChannel, event: CloseEventBase]>(1);
  public readonly error$ = new Subject<Error>();
  public readonly message$ = new Subject<T>();

  protected readonly _fetch: (data: Uint8Array) => Promise<Uint8Array>;

  constructor({fetch}: FetchChannelParams) {
    this._fetch = fetch;
    this.state$.next(ChannelState.OPEN);
    this.open$.next(this);
    this.open$.complete();
  }

  public buffer(): number {
    return 0;
  }

  public close(code?: number, reason?: string): void {}

  public isOpen(): boolean {
    return true;
  }

  public send(data: T): number {
    const uint8 = typeof data === 'string' ? toUint8Array(data) : data as Uint8Array;
    this._fetch(uint8)
      .then((response) => {
        const message: T = (typeof response === 'string' ? response : toUint8Array(response)) as unknown as T;
        this.message$.next(message);
      })
      .catch((error) => {
        this.error$.next(error);
      });
    return 0;
  }

  public send$(data: T): Observable<number> {
    return of(this.send(data));
  }
}
