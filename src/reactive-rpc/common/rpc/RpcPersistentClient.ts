import {firstValueFrom, Observable, ReplaySubject, timer} from 'rxjs';
import {filter, first, share, switchMap, takeUntil} from 'rxjs/operators';
import * as msg from '../messages';
import {StreamingRpcClient, StreamingRpcClientOptions} from './client/StreamingRpcClient';
import {ApiRpcCaller} from './caller/ApiRpcCaller';
import {RpcDuplex} from '../rpc/RpcDuplex';
import {RpcMessageStreamProcessor, RpcMessageStreamProcessorOptions} from './RpcMessageStreamProcessor';
import {PersistentChannel, PersistentChannelParams} from '../channel';
import {RpcCodec} from '../codec/RpcCodec';

export interface RpcPersistentClientParams<Ctx = unknown> {
  channel: PersistentChannelParams;
  codec: RpcCodec;
  client?: Omit<StreamingRpcClientOptions, 'send'>;
  server?: Omit<RpcMessageStreamProcessorOptions<Ctx>, 'send'>;

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

export class RpcPersistentClient<Ctx = unknown> {
  public channel: PersistentChannel;
  public rpc?: RpcDuplex<Ctx>;
  public readonly rpc$ = new ReplaySubject<RpcDuplex<Ctx>>(1);

  constructor(params: RpcPersistentClientParams<Ctx>) {
    const ping = params.ping ?? 15000;
    const codec = params.codec;
    const textEncoder = new TextEncoder();
    this.channel = new PersistentChannel(params.channel);
    this.channel.open$.pipe(filter((open) => open)).subscribe(() => {
      const close$ = this.channel.open$.pipe(filter((open) => !open));

      const duplex = new RpcDuplex<Ctx>({
        client: new StreamingRpcClient({
          ...(params.client || {}),
          send: (messages: msg.ReactiveRpcClientMessage[]): void => {
            const encoded = codec.encode(messages);
            this.channel.send$(encoded).subscribe();
          },
        }),
        server: new RpcMessageStreamProcessor<Ctx>({
          ...(params.server || {
            caller: new ApiRpcCaller({
              api: {},
            }),
            onNotification: () => {},
          }),
          send: (messages: (msg.ReactiveRpcServerMessage | msg.NotificationMessage)[]): void => {
            const encoded = codec.encode(messages);
            this.channel.send$(encoded).subscribe();
          },
        }),
      });

      this.channel.message$.pipe(takeUntil(close$)).subscribe((data) => {
        const encoded = typeof data === 'string' ? textEncoder.encode(data) : new Uint8Array(data);
        const messages = codec.decode(encoded);
        duplex.onMessages((messages instanceof Array ? messages : [messages]) as msg.ReactiveRpcMessage[], {} as Ctx);
      });

      // Send ping notifications to keep the connection alive.
      if (ping) {
        timer(ping, ping)
          .pipe(takeUntil(close$))
          .subscribe(() => {
            duplex.notify(params.pingMethod || '.ping', undefined);
          });
      }

      if (this.rpc) this.rpc.disconnect();
      this.rpc = duplex;
      this.rpc$.next(duplex);
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
