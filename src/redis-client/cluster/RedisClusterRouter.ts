import {AvlMap} from '../../util/trees/avl/AvlMap';
import {RedisClusterSlotRange} from './RedisClusterSlotRange';
import {RedisClusterNodeInfo} from './RedisClusterNodeInfo';
import type {RedisClient} from '../node';

export class RedisClusterRouter {
  /** Map of slots ordered by slot end (max) value. */
  protected readonly slots = new AvlMap<number, RedisClusterSlotRange>();

  /** Information about each node in the cluster, by node ID. */
  protected readonly infos = new Map<string, RedisClusterNodeInfo>();

  /** A sparse list of clients, by node ID. */
  protected readonly clients = new Map<string, RedisClient>();

  /**
   * Rebuild the router hash slot mapping.
   * @param client Redis client to use to query the cluster.
   */
  public async rebuild(client: RedisClient): Promise<void> {
    const slots = await client.clusterSlots();
    this.slots.clear();
    this.infos.clear();
    for (const slot of slots) {
      const range = new RedisClusterSlotRange(slot.slots[0], slot.slots[1], []);
      for (const node of slot.nodes) {
        const info = RedisClusterNodeInfo.from(node);
        this.infos.set(info.id, info);
        range.nodes.push(info);
      }
      this.slots.insert(range.max, range);
    }
    // TODO: Rebuild clients.
  }
}
