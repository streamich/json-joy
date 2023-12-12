import type {RedisClusterShardsResponseNode} from "../node/types";

export class RedisClusterNodeInfo {
  public static from = (response: RedisClusterShardsResponseNode): RedisClusterNodeInfo => {
    return new RedisClusterNodeInfo(
      response.id + '',
      Number(response.port),
      response.ip + '',
      response.endpoint + '',
      (response.role + '') as 'master' | 'replica',
      Number(response['replication-offset']),
      (response.health + '') as 'online' | 'failed' | 'loading',
    );
  };

  constructor(
    public readonly id: string,
    public readonly port: number,
    public readonly ip: string,
    public readonly endpoint: string,
    public readonly role: 'master' | 'replica',
    public readonly replicationOffset: number,
    public readonly health: 'online' | 'failed' | 'loading',
  ) {}
}
