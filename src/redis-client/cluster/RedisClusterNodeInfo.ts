export class RedisClusterNodeInfo {
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
