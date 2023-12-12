import * as net from 'net';
import * as tls from 'tls';
import {FanOut} from 'thingies/es2020/fanout';
import {PartialExcept, RedisClientCodecOpts} from '../types';
import {RespEncoder} from '../../json-pack/resp';
import {RespStreamingDecoder} from '../../json-pack/resp/RespStreamingDecoder';
import {RedisClient, ReconnectingSocket} from '../node';
import {RedisClusterRouter} from './RedisClusterRouter';
import {RedisClusterNodeInfo} from './RedisClusterNodeInfo';

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

  /** Emitted on unexpected and asynchronous errors. */
  public readonly onError = new FanOut<Error>();
  /** Emitted each time router table is rebuilt. */
  public readonly onRouter = new FanOut<void>();

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

  private initialTableBuildAttempt = 0;
  private buildInitialRouteTable(seed: number = 0): void {
    const attempt = this.initialTableBuildAttempt++;
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
      this.initialTableBuildAttempt = 0;
      this.onRouter.emit();
    })().catch((error) => {
      const delay = Math.max(Math.min(1000 * 2 ** attempt, 1000 * 60), 1000);
      setTimeout(() => this.buildInitialRouteTable(seed + 1), delay);
      this.onError.emit(error);
    });
  }

  public async whenRouterReady(): Promise<void> {
    if (!this.router.isEmpty()) return;
    return new Promise((resolve) => {
      const unsubscribe = this.onRouter.listen(() => {
        unsubscribe();
        resolve();
      });
    });
  }

  protected getAnyClient(): RedisClient {
    const randomClient = this.router.getRandomClient();
    if (!randomClient) throw new Error('NO_CLIENT');
    return randomClient;
  }

  protected async getBestAvailableReadClient(slot: number): Promise<RedisClient> {
    await this.whenRouterReady();
    const router = this.router;
    const info = router.getRandomNodeForSlot(slot);
    if (!info) {
      const client = router.getRandomClient();
      if (!client) throw new Error('NO_CLIENT');
      return client;
    }
    const client = router.getClient(info.id);
    if (client) return client;
    this.createReadClientForSlot(info);
    return this.getAnyClient();
  }

  private async createReadClientForSlot(info: RedisClusterNodeInfo): Promise<RedisClient> {
    const client = await this.createClient({
      ...this.opts.connectionConfig,
      host: info.endpoint,
      port: info.port,
    });
    this.router.setClient(info, client);
    return client;
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
