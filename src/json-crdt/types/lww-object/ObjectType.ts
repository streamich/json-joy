import {LogicalTimestamp} from '../../../json-crdt-patch/clock';
import {SetObjectKeysOperation} from '../../../json-crdt-patch/operations/SetObjectKeysOperation';
import {Document} from '../../document';
import {JsonNode} from '../../types';
import {ObjectChunk} from './ObjectChunk';

export class ObjectType implements JsonNode {
  public readonly latest: Map<string, ObjectChunk> = new Map();

  constructor(public readonly doc: Document, public readonly id: LogicalTimestamp) {}

  public get(key: string): undefined | LogicalTimestamp {
    const entry = this.latest.get(key);
    return entry ? entry.node.id : undefined;
  }

  public getId(key: string): undefined | LogicalTimestamp {
    const entry = this.latest.get(key);
    return entry ? entry.id : undefined;
  }

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

  public put(key: string, id: LogicalTimestamp, value: LogicalTimestamp) {
    const node = this.doc.nodes.get(value);
    if (!node) return;
    this.putChunk(key, new ObjectChunk(id, node));
  }

  public putChunk(key: string, chunk: ObjectChunk) {
    this.latest.set(key, chunk);
  }

  public toJson(): Record<string, unknown> {
    const obj: Record<string, unknown> = {};
    for (const [key, entry] of this.latest.entries()) obj[key] = entry.node.toJson();
    return obj;
  }

  public toString(tab: string = ''): string {
    let str = `${tab}ObjectType(${this.id.toDisplayString()})`;
    for (const [key, entry] of this.latest.entries()) {
      const node = entry.node;
      str += `\n${tab}  "${key}" :\n${node.toString(tab + '    ')}`;
    }
    return str;
  }

  public clone(doc: Document): ObjectType {
    const obj = new ObjectType(doc, this.id);
    for (const [key, {id, node}] of this.latest.entries()) {
      const nodeClone = node.clone(doc);
      obj.putChunk(key, new ObjectChunk(id, nodeClone));
    }
    doc.nodes.index(obj);
    return obj;
  }

  public *children(): IterableIterator<LogicalTimestamp> {
    for (const {node} of this.latest.values()) yield node.id;
  }
}
