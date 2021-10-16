import {firstValueFrom, Observable, ReplaySubject, timer} from 'rxjs';
import {filter, first, switchMap, takeUntil} from 'rxjs/operators';
import {Codec} from '../codec/types';
import {NotificationMessage, ReactiveRpcMessage, ReactiveRpcRequestMessage, ReactiveRpcResponseMessage} from '../messages';
import {RpcClient, RpcClientParams} from '../rpc';
import {RpcApiCaller} from '../rpc/RpcApiCaller';
import {RpcDuplex} from '../rpc/RpcDuplex';
import {RpcServer, RpcServerParams} from '../rpc/RpcServer';
import {PersistentChannel, PersistentChannelParams} from '../channel';

export interface RpcPersistentClientParams<Ctx = unknown, T = unknown> {
  channel: PersistentChannelParams;
  codec: Codec<string | Uint8Array>;
  client?: Omit<RpcClientParams<T>, 'send'>;
  server?: Omit<RpcServerParams<Ctx, T>, 'send'>;

  /**
   * Number of milliseconds to periodically send keep-alive ".ping" notification
   * messages. If not specified, will default to 15,000 (15 seconds). If 0, will
   * not send ping messages.
   */
  ping?: number;
}

export class RpcPersistentClient<Ctx = unknown, T = unknown> {
  public channel: PersistentChannel;
  public rpc?: RpcDuplex<Ctx, T>;
  public readonly rpc$ = new ReplaySubject<RpcDuplex<Ctx, T>>(1);

  constructor (params: RpcPersistentClientParams<Ctx, T>) {
    const ping = params.ping ?? 15000;
    this.channel = new PersistentChannel(params.channel);
    this.channel.open$.pipe(filter(open => open)).subscribe(() => {
      const close$ = this.channel.open$.pipe(
        filter(open => !open),
      );

      const duplex = new RpcDuplex<Ctx, T>({
        client: new RpcClient<T>({
          ...(params.client || {}),
          send: (messages: ReactiveRpcRequestMessage[]): void => {
            const encoded = params.codec.encoder.encode(messages);
            this.channel.send$(encoded).subscribe();
          },
        }),
        server: new RpcServer<Ctx, T>({
          ...(params.server || {
            caller: new RpcApiCaller({
              api: {},
            }),
            onNotification: () => {},
          }),
          send: (messages: (ReactiveRpcResponseMessage | NotificationMessage)[]): void => {
            const encoded = params.codec.encoder.encode(messages);
            this.channel.send$(encoded).subscribe();
          },
        }),
      });

      this.channel.message$
        .pipe(takeUntil(close$))
        .subscribe(data => {
          const encoded = typeof data === 'string' ? data : new Uint8Array(data);
          const messages = params.codec.decoder.decode(encoded);
          duplex.onMessages((messages instanceof Array ? messages : [messages]) as ReactiveRpcMessage<T>[], {} as Ctx);
        });

      // Send ping notifications to keep the connection alive.
      if (ping) {
        timer(ping, ping)
          .pipe(takeUntil(close$))
          .subscribe(() => {
            duplex.notify('.ping', undefined);
          });
      }

      if (this.rpc) this.rpc.disconnect();
      this.rpc = duplex;
      this.rpc$.next(duplex);
    });
  }

  public call$(method: string, data: T | Observable<T>): Observable<T> {
    return this.rpc$
      .pipe(
        first(),
        switchMap(rpc => rpc.call$(method, data as any)),
      );
  }

  public call(method: string, data: T): Promise<T> {
    return firstValueFrom(this.call$(method, data));
  }

  public notify(method: string, data: T): void {
    this.rpc$
      .subscribe(rpc => rpc.notify(method, data));
  }

  public start() {
    this.channel.start();
  }

  public stop() {
    this.channel.stop();
    if (this.rpc) this.rpc.stop();
  }
}
