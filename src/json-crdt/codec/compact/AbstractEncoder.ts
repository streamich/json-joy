import {ArrayChunk} from '../../types/rga-array/ArrayChunk';
import {ArrayType} from '../../types/rga-array/ArrayType';
import {BinaryChunk} from '../../types/rga-binary/BinaryChunk';
import {BinaryType} from '../../types/rga-binary/BinaryType';
import {ConstantType} from '../../types/const/ConstantType';
import {DocRootType} from '../../types/lww-doc-root/DocRootType';
import {ITimestamp} from '../../../json-crdt-patch/clock';
import {JsonNode} from '../../types';
import {ObjectType} from '../../types/lww-object/ObjectType';
import {StringChunk} from '../../types/rga-string/StringChunk';
import {StringType} from '../../types/rga-string/StringType';
import {toBase64} from '../../../util/base64/encode';
import {TypeCode, ValueCode} from './constants';
import {ValueType} from '../../types/lww-value/ValueType';

export abstract class AbstractEncoder {
  protected abstract ts(arr: unknown[], ts: ITimestamp): void;

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
    else if (node instanceof BinaryType) return this.encodeBin(arr, node);
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

  protected encodeBin(arr: unknown[], obj: BinaryType): void {
    const res: unknown[] = [TypeCode.bin];
    arr.push(res);
    this.ts(res, obj.id);
    for (const chunk of obj.chunks()) this.encodeBinChunk(res, chunk);
  }

  protected encodeBinChunk(arr: unknown[], chunk: BinaryChunk): void {
    this.ts(arr, chunk.id);
    if (chunk.deleted) arr.push(chunk.deleted);
    else arr.push(toBase64(chunk.buf!));
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
