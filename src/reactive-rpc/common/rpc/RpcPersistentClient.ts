import * as msg from '../messages';
import {firstValueFrom, Observable, ReplaySubject, timer} from 'rxjs';
import {filter, first, share, switchMap, takeUntil} from 'rxjs/operators';
import {StreamingRpcClient, StreamingRpcClientOptions} from './client/StreamingRpcClient';
import {PersistentChannel, PersistentChannelParams} from '../channel';
import type {RpcCodec} from '../codec/RpcCodec';

export interface RpcPersistentClientParams {
  channel: PersistentChannelParams;
  codec: RpcCodec;
  client?: Omit<StreamingRpcClientOptions, 'send'>;

  /**
   * Number of milliseconds to periodically send keep-alive ".ping" notification
   * messages. If not specified, will default to 15,000 (15 seconds). If 0, will
   * not send ping messages.
   */
  ping?: number;

  /**
   * The notification method name that is used for ping keep-alive messages, if
   * not specified, defaults to ".ping".
   */
  pingMethod?: string;
}

/**
 * RPC client which automatically reconnects if disconnected.
 */
export class RpcPersistentClient {
  public channel: PersistentChannel;
  public rpc?: StreamingRpcClient;
  public readonly rpc$ = new ReplaySubject<StreamingRpcClient>(1);

  constructor(params: RpcPersistentClientParams) {
    const ping = params.ping ?? 15000;
    const codec = params.codec;
    const textEncoder = new TextEncoder();
    this.channel = new PersistentChannel(params.channel);
    this.channel.open$.pipe(filter((open) => open)).subscribe(() => {
      const close$ = this.channel.open$.pipe(filter((open) => !open));
      const client = new StreamingRpcClient({
        ...(params.client || {}),
        send: (messages: msg.ReactiveRpcClientMessage[]): void => {
          const encoded = codec.encode(messages, codec.req);
          this.channel.send$(encoded).subscribe();
        },
      });

      this.channel.message$.pipe(takeUntil(close$)).subscribe((data) => {
        const encoded = typeof data === 'string' ? textEncoder.encode(data) : new Uint8Array(data);
        const messages = codec.decode(encoded, codec.res);
        client.onMessages((messages instanceof Array ? messages : [messages]) as msg.ReactiveRpcServerMessage[]);
      });

      // Send ping notifications to keep the connection alive.
      if (ping) {
        timer(ping, ping)
          .pipe(takeUntil(close$))
          .subscribe(() => {
            client.notify(params.pingMethod || '.ping', undefined);
          });
      }

      if (this.rpc) this.rpc.disconnect();
      this.rpc = client;
      this.rpc$.next(client);
    });
  }

  public call$(method: string, data: unknown | Observable<unknown>): Observable<unknown> {
    return this.rpc$.pipe(
      first(),
      switchMap((rpc) => rpc.call$(method, data as any)),
      share(),
    );
  }

  public call(method: string, data: unknown): Promise<unknown> {
    return firstValueFrom(this.call$(method, data));
  }

  public notify(method: string, data: unknown): void {
    this.rpc$.subscribe((rpc) => rpc.notify(method, data));
  }

  public start() {
    this.channel.start();
  }

  public stop() {
    this.channel.stop();
    if (this.rpc) this.rpc.stop();
  }
}
