import * as net from 'net';
import * as tls from 'tls';
import {PartialExcept, RedisClientCodecOpts} from './types';
import {RespEncoder} from '../json-pack/resp';
import {RespStreamingDecoder} from '../json-pack/resp/RespStreamingDecoder';
import {RedisClient} from './RedisClient';
import {ReconnectingSocket} from './ReconnectingSocket';
import {FanOut} from 'thingies/es2020/fanout';

export interface RedisClusterClientOpts extends RedisClientCodecOpts {
  /** Nodes to connect to to retrieve cluster configuration. */
  seeds: RedisClusterClientNodeConfig[];
  /** Shared config applied to all nodes. */
  connectionConfig?: RedisClusterClientNodeConfig;
}

export interface RedisClusterClientNodeConfig {
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

export class RedisClusterClient {
  protected readonly encoder: RespEncoder;
  protected readonly decoder: RespStreamingDecoder;
  protected stopped = false;

  public readonly onError = new FanOut<Error>();

  constructor(protected readonly opts: PartialExcept<RedisClusterClientOpts, 'seeds'>) {
    this.encoder = opts.encoder ?? new RespEncoder();
    this.decoder = opts.decoder ?? new RespStreamingDecoder();
  }

  public start (): void {
    ((async () => {
      const {seeds, connectionConfig} = this.opts;
      const client = await this.startNodeClientRaw({
        ...connectionConfig,
        ...seeds[0],
      });
      if (this.stopped) return;
      // const seedClients = await Promise.all(seeds.map((seed) => this.startNodeClientRaw({
      //   ...connectionConfig,
      //   ...seed,
      // })));
      console.log('shards');
      const clusterShards = await client.cmd(['CLUSTER', 'SHARDS']);
      console.log('clusterShards', JSON.stringify(clusterShards, null, 2));
    })()).catch((err) => {
      this.onError.emit(err);
    });
  }

  public stop (): void {}

  protected async startNodeClientRaw(config: RedisClusterClientNodeConfig): Promise<RedisClient> {
    const client = this.createNodeClientRaw(config);
    client.start();
    const {user, pwd} = config;
    const res = await client.hello(3, pwd, user);
    console.log('res', res);
    return client;
  }

  protected createNodeClientRaw(config: RedisClusterClientNodeConfig): RedisClient {
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
