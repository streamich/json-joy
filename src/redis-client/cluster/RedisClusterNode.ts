import type {RedisClient} from '../node';
import type {RedisClusterNodeInfo} from './RedisClusterNodeInfo';

export class RedisClusterNode {
  constructor(public info: RedisClusterNodeInfo, public client: RedisClient) {}
}
