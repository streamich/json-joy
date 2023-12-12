import {AvlMap} from '../../util/trees/avl/AvlMap';
import {RedisClusterSlotRange} from './RedisClusterSlotRange';
import {RedisClusterNodeInfo} from './RedisClusterNodeInfo';
import type {RedisClient} from '../node';

export class RedisClusterRouter {
  /** Map of slots ordered by slot end (max) value. */
  protected readonly ranges = new AvlMap<number, RedisClusterSlotRange>();

  /** Information about each node in the cluster, by node ID. */
  protected readonly infos = new Map<string, RedisClusterNodeInfo>();

  /** A sparse list of clients, by node ID. */
  protected readonly clients = new Map<string, RedisClient>();

  /** Whether the route table is empty. */
  public isEmpty(): boolean {
    return this.ranges.isEmpty();
  }

  /**
   * Rebuild the router hash slot mapping.
   * @param client Redis client to use to query the cluster.
   */
  public async rebuild(client: RedisClient): Promise<void> {
    const [id, slots] = await Promise.all([
      client.clusterMyId(),
      client.clusterShards(),
    ]);
    this.ranges.clear();
    this.infos.clear();
    for (const slot of slots) {
      const range = new RedisClusterSlotRange(slot.slots[0], slot.slots[1], []);
      for (const node of slot.nodes) {
        const info = RedisClusterNodeInfo.from(node);
        this.infos.set(info.id, info);
        range.nodes.push(info);
      }
      this.ranges.insert(range.max, range);
    }
    this.clients.forEach((client, id) => {
      if (!this.infos.has(id)) {
        client.stop();
        this.clients.delete(id);
      }
    });
    if (this.infos.has(id)) this.clients.set(id, client);
  }
}
