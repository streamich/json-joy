import {LogicalTimestamp, VectorClock} from '../../../json-crdt-patch/clock';
import {ClockEncoder} from '../../../json-crdt-patch/codec/clock/ClockEncoder';
import {Document} from '../../document';
import {JsonNode} from '../../types';
import {ConstantType} from '../../types/const/ConstantType';
import {DocRootType} from '../../types/lww-doc-root/DocRootType';
import {ObjectType} from '../../types/lww-object/ObjectType';
import {ValueType} from '../../types/lww-value/ValueType';
import {ArrayChunk} from '../../types/rga-array/ArrayChunk';
import {ArrayType} from '../../types/rga-array/ArrayType';
import {StringChunk} from '../../types/rga-string/StringChunk';
import {StringType} from '../../types/rga-string/StringType';
import {TypeCode, ValueCode} from './constants';

export class Encoder {
  protected clock!: ClockEncoder;

  public encode(doc: Document): unknown[] {
    this.clock = new ClockEncoder(doc.clock);
    const snapshot: unknown[] = [null];
    this.encodeRoot(snapshot, doc.root);
    snapshot[0] = this.clock.toJson();
    return snapshot;
  }

  protected ts(arr: unknown[], ts: LogicalTimestamp) {
    this.clock.append(ts).push(arr);
  }

  protected encodeRoot(arr: unknown[], root: DocRootType): void {
    this.ts(arr, root.id);
    if (!root.node) arr.push(0);
    else this.encodeNode(arr, root.node);
  }

  protected encodeNode(arr: unknown[], node: JsonNode): void {
    if (node instanceof ObjectType) return this.encodeObj(arr, node);
    else if (node instanceof ArrayType) return this.encodeArr(arr, node);
    else if (node instanceof StringType) return this.encodeStr(arr, node);
    else if (node instanceof ValueType) return this.encodeVal(arr, node);
    else if (node instanceof ConstantType) return this.encodeConst(arr, node);
    throw new Error('UNKNOWN_NODE');
  }

  protected encodeObj(arr: unknown[], obj: ObjectType): void {
    const res: unknown[] = [TypeCode.obj];
    arr.push(res);
    this.ts(res, obj.id);
    for (const [key, entry] of obj.latest.entries()) {
      res.push(key);
      this.ts(res, entry.id);
      this.encodeNode(res, entry.node);
    }
  }

  protected encodeArr(arr: unknown[], obj: ArrayType): void {
    const res: unknown[] = [TypeCode.arr];
    arr.push(res);
    this.ts(res, obj.id);
    for (const chunk of obj.chunks()) this.encodeArrChunk(res, chunk);
  }

  protected encodeArrChunk(arr: unknown[], chunk: ArrayChunk): void {
    this.ts(arr, chunk.id);
    if (chunk.deleted) arr.push(chunk.deleted);
    else {
      const nodes: unknown[] = [];
      for (const n of chunk.nodes!) this.encodeNode(nodes, n);
      arr.push(nodes);
    }
  }

  protected encodeStr(arr: unknown[], obj: StringType): void {
    const res: unknown[] = [TypeCode.str];
    arr.push(res);
    this.ts(res, obj.id);
    for (const chunk of obj.chunks()) this.encodeStrChunk(res, chunk);
  }

  protected encodeStrChunk(arr: unknown[], chunk: StringChunk): void {
    this.ts(arr, chunk.id);
    if (chunk.deleted) arr.push(chunk.deleted);
    else arr.push(chunk.str!);
  }

  protected encodeVal(arr: unknown[], obj: ValueType): void {
    const res: unknown[] = [TypeCode.val];
    arr.push(res);
    this.ts(res, obj.id);
    this.ts(res, obj.writeId);
    res.push(obj.value);
  }

  protected encodeConst(arr: unknown[], obj: ConstantType): void {
    switch (obj.value) {
      case null: {
        arr.push(ValueCode.null);
        return;
      }
      case false: {
        arr.push(ValueCode.false);
        return;
      }
      case true: {
        arr.push(ValueCode.true);
        return;
      }
      case undefined: {
        arr.push(ValueCode.undefined);
        return;
      }
    }
    const res: unknown[] = [TypeCode.const];
    arr.push(res);
    res.push(obj.value);
  }
}
