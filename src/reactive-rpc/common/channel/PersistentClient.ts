import {Observable, ReplaySubject} from 'rxjs';
import {filter, switchMap, takeUntil} from 'rxjs/operators';
import {Codec} from '../codec/types';
import {NotificationMessage, ReactiveRpcMessage, ReactiveRpcRequestMessage, ReactiveRpcResponseMessage} from '../messages';
import {RpcClient, RpcClientParams} from '../rpc';
import {RpcApiCaller} from '../rpc/RpcApiCaller';
import {RpcDuplex} from '../rpc/RpcDuplex';
import {RpcServer, RpcServerParams} from '../rpc/RpcServer';
import {PersistentChannel, PersistentChannelParams} from './channel';

export interface PersistentClientParams<Ctx = unknown, T = unknown> {
  channel: PersistentChannelParams;
  codec: Codec<string | Uint8Array>;
  client?: Omit<RpcClientParams<T>, 'send'>;
  server?: Omit<RpcServerParams<Ctx, T>, 'send'>;
}

export class PersistentClient<Ctx = unknown, T = unknown> {
  public channel: PersistentChannel;
  public rpc?: RpcDuplex<Ctx, T>;
  public readonly rpc$ = new ReplaySubject<RpcDuplex<Ctx, T>>(1);

  constructor (params: PersistentClientParams<Ctx, T>) {
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

      if (this.rpc) this.rpc.disconnect();
      this.rpc = duplex;
      this.rpc$.next(duplex);
    });
  }

  public call$(method: string, data: T | Observable<T>): Observable<T> {
    return this.rpc$
      .pipe(
        switchMap(rpc => rpc.call$(method, data as any)),
      );
  }

  public notify(method: string, data: T): void {
    this.rpc$
      .subscribe(rpc => rpc.notify(method, data));
  }

  public stop() {
    if (this.rpc) this.rpc.stop();
  }
}
