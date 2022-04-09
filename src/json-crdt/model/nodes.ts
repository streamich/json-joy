import type {Identifiable} from '../../json-crdt-patch/Identifiable';
import type {ITimestamp} from '../../json-crdt-patch/clock';

export interface NodeIndex<T extends Identifiable> {
  /**
   * Retrieve any known operation in this document by its ID.
   */
  get(id: ITimestamp): undefined | T;

  /**
   * Store an operation in the global operation index.
   */
  index(operation: T): void;

  /**
   * Deletes operation from the index.
   */
  delete(id: ITimestamp): void;

  /**
   * Loops through all operations in the index.
   */
  iterate(): IterableIterator<T>;

  /**
   * Returns a randomly picked entry. Or none, if there are no entries.
   */
  random(): T | null;
}

/**
 * Node index for document which uses logical time.
 */
export class LogicalNodeIndex<T extends Identifiable> implements NodeIndex<T> {
  /**
   * An index of all operations in this document accessible by operation ID.
   *
   *     (sessionId, time) -> node
   */
  public entries: Map<number, Map<number, T>> = new Map();

  public get(id: ITimestamp): undefined | T {
    const {time} = id;
    const sessionId = id.getSessionId();
    const map1 = this.entries;
    const map2 = map1.get(sessionId);
    if (!map2) return undefined;
    const operation = map2.get(time);
    if (operation) return operation;
    return undefined;
  }

  public index(operation: T) {
    const {id} = operation;
    const sessionId = id.getSessionId();
    const {time} = id;
    let map = this.entries.get(sessionId);
    if (!map) {
      map = new Map<number, T>();
      this.entries.set(sessionId, map);
    }
    map.set(time, operation);
  }

  public delete(id: ITimestamp) {
    const {time} = id;
    const timeMap = this.entries.get(id.getSessionId());
    if (!timeMap) return;
    timeMap.delete(time);
  }

  public *iterate(): IterableIterator<T> {
    for (const map of this.entries.values()) yield* map.values();
  }

  public random(): T | null {
    const sessions = [...this.entries.keys()];
    if (!sessions.length) return null;
    const sessionId = sessions[Math.floor(Math.random() * sessions.length)];
    const map = this.entries.get(sessionId)!;
    const nodeCount = map.size;
    const index = Math.floor(Math.random() * nodeCount);
    let pos = 0;
    for (const node of map.values()) {
      if (pos === index) return node;
      pos++;
    }
    return null;
  }
}

/**
 * Node index which uses server time.
 */
export class ServerNodeIndex<T extends Identifiable> implements NodeIndex<T> {
  /**
   * An index of all nodes in this document accessible by ID.
   *
   *     time -> node
   */
  public entries: Map<number, T> = new Map();

  public get(id: ITimestamp): undefined | T {
    return this.entries.get(id.time);
  }

  public index(node: T): void {
    const {id} = node;
    this.entries.set(id.time, node);
  }

  public delete(id: ITimestamp) {
    this.entries.delete(id.time);
  }

  public *iterate(): IterableIterator<T> {
    yield* this.entries.values();
  }

  public random(): T | null {
    const nodeCount = this.entries.size;
    const index = Math.floor(Math.random() * nodeCount);
    let pos = 0;
    for (const node of this.entries.values()) {
      if (pos === index) return node;
      pos++;
    }
    return null;
  }
}
