import * as net from 'net';
import * as tls from 'tls';
import {FanOut} from 'thingies/es2020/fanout';
import {PartialExcept, RedisClientCodecOpts} from '../types';
import {RespEncoder} from '../../json-pack/resp';
import {RespStreamingDecoder} from '../../json-pack/resp/RespStreamingDecoder';
import {RedisClient, ReconnectingSocket} from '../node';
import {RedisClusterNode} from './RedisClusterNode';

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
  protected stopped = false;

  public readonly onError = new FanOut<Error>();

  constructor(protected readonly opts: PartialExcept<RedisClusterOpts, 'seeds'>) {
    this.encoder = opts.encoder ?? new RespEncoder();
    this.decoder = opts.decoder ?? new RespStreamingDecoder();
  }

  public start(): void {
    ((async () => {
      const {seeds, connectionConfig} = this.opts;
      const client = await this.createNode({
        ...connectionConfig,
        ...seeds[0],
      });
      if (this.stopped) return;
      // const seedClients = await Promise.all(seeds.map((seed) => this.startNodeClientRaw({
      //   ...connectionConfig,
      //   ...seed,
      // })));
      console.log('shards...');
      // const clusterShards = await client.cmd(['CLUSTER', 'SHARDS']);
      // console.log('clusterShards', JSON.stringify(clusterShards, null, 2));
    })()).catch((err) => {
      this.onError.emit(err);
    });
  }

  public stop(): void {}

  protected async createNode(config: RedisClusterNodeConfig): Promise<RedisClusterNode> {
    const client = this.createNodeClient(config);
    client.start();
    const {user, pwd} = config;
    await client.hello(3, pwd, user);
    const res = await Promise.all([
      client.cmd(['CLUSTER', 'MYID'], {utf8Res: true}),
      client.cmd(['CLUSTER', 'SLOTS'], {utf8Res: true}),
    ]);
    console.log('res', res);
    console.log('asdf', JSON.stringify(res[1], null, 2));
    const node = new RedisClusterNode('asdg', client);
    return node;
  }

  protected createNodeClient(config: RedisClusterNodeConfig): RedisClient {
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
