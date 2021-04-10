import type {ClockCodec} from '../../codec/compact/ClockCodec';
import {asString} from 'json-schema-serializer';
import {json_string} from 'ts-brand-json';
import {LogicalTimestamp} from '../../../json-crdt-patch/clock';
import {SetObjectKeysOperation} from '../../../json-crdt-patch/operations/SetObjectKeysOperation';
import {Document} from '../../document';
import {JsonNode} from '../../types';
import {ObjectChunk} from './ObjectChunk';
import {decodeNode} from '../../codec/compact/decodeNode';

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
    for (const [key, entry] of this.latest.entries())
      obj[key] = entry.node.toJson();
    return obj;
  }

  public toString(tab: string = ''): string {
    let str = `${tab}ObjectType(${this.id.toDisplayString()})`;
    for (const [key, entry] of this.latest.entries()) {
      const node = entry.node;
      str += `\n${tab}  "${key}" :\n${node.toString(tab + '    ')}`
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

  public encodeCompact(codec: ClockCodec): json_string<unknown[]> {
    let str: string = '[0,' + codec.encodeTs(this.id);
    for (const [key, value] of this.latest.entries()) {
      const node = value.node;
      str += ',' + asString(key) + ',' + codec.encodeTs(value.id) + ',' + node.encodeCompact(codec);
    }
    return str + ']' as json_string<Array<number | string>>;
  }

  public static decodeCompact(doc: Document, codec: ClockCodec, data: unknown[]): ObjectType {
    const length = data.length;
    const objId = codec.decodeTs(data[1] as number, data[2] as number);
    const obj = new ObjectType(doc, objId);
    for (let i = 3; i < length;) {
      const key = data[i++] as string;
      const id = codec.decodeTs(data[i++] as number, data[i++] as number);
      const value = decodeNode(doc, codec, data[i++]);
      obj.put(key, id, value.id);
    }
    return obj;
  }
}
