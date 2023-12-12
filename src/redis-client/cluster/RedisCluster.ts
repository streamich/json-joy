import * as net from 'net';
import * as tls from 'tls';
import {FanOut} from 'thingies/es2020/fanout';
import {PartialExcept, RedisClientCodecOpts} from '../types';
import {RespEncoder} from '../../json-pack/resp';
import {RespStreamingDecoder} from '../../json-pack/resp/RespStreamingDecoder';
import {RedisClient, ReconnectingSocket} from '../node';
import {RedisClusterRouter} from './RedisClusterRouter';

export interface RedisClusterOpts extends RedisClientCodecOpts {
  /** Nodes to connect to to retrieve cluster configuration. */
  seeds: RedisClusterNodeConfig[];
  /** Shared config applied to all nodes. */
  connectionConfig?: RedisClusterNodeConfig;
}

export interface RedisClusterNodeConfig {
  /** Hostname or IP address of the Redis node. Defaults to 'localhost'. */
  host?: string;
  /** Port of the Redis node. Defaults to 6379. */
  port?: number;
  /** Username to use for authentication. */
  user?: string;
  /** Password to use for authentication. Auth is skipped if omitted. */
  pwd?: string;
  /** Whether to use TLS. Defaults to false. */
  tls?: boolean;
  /** TLS options. */
  secureContext?: tls.SecureContextOptions;
}

export class RedisCluster {
  protected readonly encoder: RespEncoder;
  protected readonly decoder: RespStreamingDecoder;
  protected readonly router = new RedisClusterRouter();
  protected stopped = false;

  public readonly onError = new FanOut<Error>();

  constructor(protected readonly opts: PartialExcept<RedisClusterOpts, 'seeds'>) {
    this.encoder = opts.encoder ?? new RespEncoder();
    this.decoder = opts.decoder ?? new RespStreamingDecoder();
  }

  public start(): void {
    this.stopped = false;
    this.buildInitialRouteTable();
  }

  public stop(): void {
    this.stopped = true;
  }

  private buildInitialRouteTable(seed: number = 0): void {
    (async () => {
      if (this.stopped) return;
      if (!this.router.isEmpty()) return;
      const {seeds, connectionConfig} = this.opts;
      seed = seed % seeds.length;
      const client = await this.createClient({
        ...connectionConfig,
        ...seeds[seed],
      });
      if (this.stopped) return;
      await this.router.rebuild(client);
      if (this.stopped) return;
    })().catch((error) => {
      setTimeout(() => this.buildInitialRouteTable(seed + 1), 1000);
      this.onError.emit(error);
    });
  }

  protected async createClient(config: RedisClusterNodeConfig): Promise<RedisClient> {
    const client = this.createClientRaw(config);
    client.start();
    const {user, pwd} = config;
    await client.hello(3, pwd, user);
    return client;
  }

  protected createClientRaw(config: RedisClusterNodeConfig): RedisClient {
    const {host = 'localhost', port = 6379} = config;
    const client = new RedisClient({
      socket: new ReconnectingSocket({
        createSocket: config.tls
          ? () => tls.connect({
            host,
            port,
            ...config.secureContext,
          })
          : () => net.connect({
            host,
            port,
          }),
      }),
      encoder: this.encoder,
      decoder: this.decoder,
    });
    return client;
  }
}
