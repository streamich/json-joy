import type {Identifiable} from '../json-crdt-patch/Identifiable';
import {Timestamp} from '../json-crdt-patch/clock';

export class IdentifiableIndex<T extends Identifiable> {
  /**
   * An index of all operations in this document accessible by operation ID.
   *
   *     (sessionId, time) -> operation
   */
  public entries: Map<number, Map<number, T>> = new Map();

  /**
   * Retrieve any known operation in this document by its ID. Or, if operation,
   * is composed of multiple operations (op.span > 1), still retrieve that operation
   * if the actual ID is inside the operation.
   */
  public get(id: Timestamp): undefined | T {
    const {time} = id;
    const sessionId = id.getSessionId();
    const map1 = this.entries;
    const map2 = map1.get(sessionId);
    if (!map2) return undefined;
    const operation = map2.get(time);
    if (operation) return operation;
    // TODO: This block is necessary only if entries span more than one timestamp.
    // for (const operation of map2.values()) {
    //   const operationTime = operation.id.time;
    //   if ((operationTime < time) && (operationTime + (operation.span ? operation.span() : 1) - 1 >= time))
    //     return operation;
    // }
    return undefined;
  }

  /**
   * Index an operation in the global operation index of this document.
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

  public delete(id: Timestamp) {
    const {time} = id;
    const timeMap = this.entries.get(id.getSessionId());
    if (!timeMap) return;
    timeMap.delete(time);
  }

  public *iterate() {
    for (const map of this.entries.values()) yield* map.values();
  }
}
