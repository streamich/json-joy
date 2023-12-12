import type {RedisClient} from '../node';

export class RedisClusterNode {
  constructor(public id: string, public client: RedisClient) {}
}
