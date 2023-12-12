export type RedisClusterSlotsResponse = RedisClusterSlotsResponseSlot[];

export interface RedisClusterSlotsResponseSlot {
  slots: [number, number];
  nodes: RedisClusterSlotsResponseNode[];
}

export interface RedisClusterSlotsResponseNode {
  id: string;
  port: number;
  ip: string;
  endpoint: string;
  role: 'master' | 'replica';
  'replication-offset': number;
  health: 'online' | 'failed' | 'loading';
}
