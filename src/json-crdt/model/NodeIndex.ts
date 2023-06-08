import type {Identifiable} from '../../json-crdt-patch/Identifiable';
import {ITimestampStruct, toDisplayString} from '../../json-crdt-patch/clock';

/**
 * @todo Check if this can be sped up by using a tree.
 */

/**
 * Node index for document which uses logical time.
 */
export class NodeIndex<T extends Identifiable> {
  /**
   * An index of all operations in this document accessible by operation ID.
   *
   *     (sessionId, time) -> node
   */
  public entries: Map<number, Map<number, T>> = new Map();

  /**
   * Retrieve any known operation in this document by its ID.
   */
  public get(id: ITimestampStruct): undefined | T {
    const {time} = id;
    const sessionId = id.sid;
    const map1 = this.entries;
    const map2 = map1.get(sessionId);
    if (!map2) return undefined;
    const operation = map2.get(time);
    if (operation) return operation;
    return undefined;
  }

  /**
   * Add an item to the index.
   */
  public set(operation: T): void {
    const {id} = operation;
    const sessionId = id.sid;
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
  public delete(id: ITimestampStruct): void {
    const {time} = id;
    const timeMap = this.entries.get(id.sid);
    if (!timeMap) return;
    timeMap.delete(time);
  }

  /**
   * Loops through all entries in the index.
   */
  public forEach(callback: (node: T) => void): void {
    this.entries.forEach((map) => {
      map.forEach(callback);
    });
  }

  public toString(tab: string = ''): string {
    const lines: string[] = [];
    this.forEach((node) => {
      lines.push(`${node.constructor.name} ${toDisplayString(node.id)}`);
    });
    let out = '';
    for (let i = 0; i < lines.length; i++) {
      const isLast = i === lines.length - 1;
      out += `\n${tab}${isLast ? '└─' : '├─'} ${lines[i]}`;
    }
    return `${this.constructor.name}${out}`;
  }
}
