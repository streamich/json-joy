import type {Identifiable} from '../../json-crdt-patch/Identifiable';
import type {ITimestamp} from '../../json-crdt-patch/clock';

export class IdentifiableIndex<T extends Identifiable> {
  /**
   * An index of all operations in this document accessible by operation ID.
   *
   *     (sessionId, time) -> operation
   */
  public entries: Map<number, Map<number, T>> = new Map();

  /**
   * Retrieve any known operation in this document by its ID.
   */
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

  /**
   * Store an operation in the global operation index.
   */
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

  /**
   * Deletes operation from the index.
   */
  public delete(id: ITimestamp) {
    const {time} = id;
    const timeMap = this.entries.get(id.getSessionId());
    if (!timeMap) return;
    timeMap.delete(time);
  }

  /**
   * Loops through all operations in the index.
   */
  public *iterate() {
    for (const map of this.entries.values()) yield* map.values();
  }
}
