import {LogicalTimestamp} from '../../json-crdt-patch/clock';
import {SetObjectKeysOperation} from '../../json-crdt-patch/operations/SetObjectKeysOperation';
import {UNDEFINED_ID} from '../constants';
import {Document} from '../document';
import {JsonNode} from '../types';
import {LWWObjectEntry} from './LWWObjectEntry';

export class LWWObjectType implements JsonNode {
  private readonly latest: Map<string, LWWObjectEntry> = new Map();

  constructor(public readonly doc: Document, public readonly id: LogicalTimestamp) {}

  public insert(op: SetObjectKeysOperation) {
    const {latest: last} = this;
    const clock = op.id.clock();
    for (const [key, value] of op.tuples) {
      const id = clock.tick(1);
      const lastEntry = last.get(key);
      if (lastEntry) if (lastEntry.id.compare(id) >= 0) continue;
      this.put(key, id, value);
    }
  }

  private put(key: string, id: LogicalTimestamp, value: LogicalTimestamp) {
    const entry = new LWWObjectEntry(id, value);
    this.latest.set(key, entry);
  }

  public toJson(): Record<string, unknown> {
    const obj: Record<string, unknown> = {};
    for (const [key, entry] of this.latest.entries()) {
      const {value} = entry;
      if (value.compare(UNDEFINED_ID) === 0) continue;
      const node = this.doc.nodes.get(value);
      if (!node) continue;
      obj[key] = node.toJson();
    }
    return obj;
  }

  public toString(tab: string = ''): string {
    return `${tab}obj(${this.id.toString()})`;
  }
}
