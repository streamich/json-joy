import {BehaviorSubject, map, type Observable} from 'rxjs';
import {toUint8Array} from '@jsonjoy.com/buffers/lib/toUint8Array';
import {decodeUtf8} from '@jsonjoy.com/buffers/lib/utf8/decodeUtf8';
import {toBuf} from '@jsonjoy.com/buffers/lib/toBuf';
import {ChannelState} from './constants';
import type {CloseEventBase, PhysicalChannel} from './types';

/**
 * A {@link PhysicalChannel} that converts incoming and outgoing messages to
 * UTF-8 strings.
 */
export class Utf8Channel implements PhysicalChannel<string> {
  public readonly state$: BehaviorSubject<ChannelState>;
  public readonly open$: Observable<PhysicalChannel>;
  public readonly close$: Observable<[self: PhysicalChannel, event: CloseEventBase]>;
  public readonly error$: Observable<Error>;
  public readonly message$: Observable<string>;

  constructor(protected readonly channel: PhysicalChannel<string | Uint8Array>) {
    this.state$ = channel.state$;
    this.open$ = channel.open$;
    this.close$ = channel.close$;
    this.error$ = channel.error$;
    this.message$ = channel.message$.pipe(
      map((data) => (typeof data === 'string' ? data : decodeUtf8(data, 0, data.length)))
    );
  }

  public buffer(): number {
    return this.channel.buffer();
  }

  public close(code?: number, reason?: string): void {
    this.channel.close(code, reason);
  }

  public isOpen(): boolean {
    return this.channel.isOpen();
  }

  public send(data: string | Uint8Array): number {
    return this.channel.send(typeof data === 'string' ? toBuf(data) : data);
  }

  public send$(data: string | Uint8Array): Observable<number> {
    return this.channel.send$(toUint8Array(data));
  }
}
