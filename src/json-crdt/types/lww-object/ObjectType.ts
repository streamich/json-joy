import {LogicalTimestamp} from '../../../json-crdt-patch/clock';
import {SetObjectKeysOperation} from '../../../json-crdt-patch/operations/SetObjectKeysOperation';
import {UNDEFINED_ID} from '../../../json-crdt-patch/constants';
import {Document} from '../../document';
import {JsonNode} from '../../types';
import {ObjectEntry} from './ObjectEntry';
import {asString} from 'json-schema-serializer';
import {json_string} from 'ts-brand-json';
import {UNDEFINED} from '../../constants';

export class ObjectType implements JsonNode {
  private readonly latest: Map<string, ObjectEntry> = new Map();

  constructor(public readonly doc: Document, public readonly id: LogicalTimestamp) {}

  public get(key: string): undefined | LogicalTimestamp {
    const entry = this.latest.get(key);
    return entry ? entry.value : undefined;
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
    const entry = new ObjectEntry(id, value);
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
    let str = `${tab}ObjectType(${this.id.toDisplayString()})`;
    for (const [key, value] of this.latest.entries()) {
      const node = this.doc.nodes.get(value.value) || UNDEFINED;
      str += `\n${tab}  "${key}" :\n${node.toString(tab + '    ')}`
    }
    return str;
  }

  public clone(doc: Document): ObjectType {
    const obj = new ObjectType(doc, this.id);
    for (const [key, {id, value}] of this.latest.entries()) obj.put(key, id, value);
    return obj;
  }

  public serialize(): json_string<Array<number | string>> {
    const {id} = this;
    let str: string = '[0,' + id.sessionId + ',' + id.time + ',' + this.latest.size;
    for (const [key, value] of this.latest.entries()) {
      str += ',' + asString(key) + ',' + value.id.sessionId + ',' + value.id.time + ',' + value.value.sessionId + ',' + value.value.time;
    }
    return str + ']' as json_string<Array<number | string>>;
  }

  public static deserialize(doc: Document, data: Array<number | string>): ObjectType {
    const [, sessionId, time, length] = data;
    const obj = new ObjectType(doc, new LogicalTimestamp(sessionId as number, time as number));
    let i = 4;
    for (let j = 0; j < length; j++) {
      const key = data[i++] as string;
      const id = new LogicalTimestamp(data[i++] as number, data[i++] as number);
      const value = new LogicalTimestamp(data[i++] as number, data[i++] as number);
      obj.put(key, id, value);
    }
    return obj;
  }
}
