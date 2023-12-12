export type RedisClusterShardsResponse = RedisClusterShardsResponseSlot[];

export interface RedisClusterShardsResponseSlot {
  slots: [number, number];
  nodes: RedisClusterShardsResponseNode[];
}

export interface RedisClusterShardsResponseNode {
  id: string;
  port: number;
  ip: string;
  endpoint: string;
  role: 'master' | 'replica';
  'replication-offset': number;
  health: 'online' | 'failed' | 'loading';
}
