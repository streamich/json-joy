import type {ITimestamp} from '../../../json-crdt-patch/clock';
import {JsonNode} from '../../types';
import {ConstantType} from '../../types/const/ConstantType';
import {DocRootType} from '../../types/lww-doc-root/DocRootType';
import {ObjectType} from '../../types/lww-object/ObjectType';
import {ValueType} from '../../types/lww-value/ValueType';
import {ArrayChunk} from '../../types/rga-array/ArrayChunk';
import {ArrayType} from '../../types/rga-array/ArrayType';
import {StringChunk} from '../../types/rga-string/StringChunk';
import {StringType} from '../../types/rga-string/StringType';
import {
  RootJsonCrdtNode,
  JsonCrdtNode,
  ObjectJsonCrdtNode,
  ObjectJsonCrdtChunk,
  ArrayJsonCrdtNode,
  ArrayJsonCrdtChunk,
  JsonCrdtRgaTombstone,
  ValueJsonCrdtNode,
  StringJsonCrdtNode,
  StringJsonCrdtChunk,
  ConstantJsonCrdtNode,
} from './types';

export abstract class AbstractEncoder<Id> {
  abstract encodeTimestamp(ts: ITimestamp): Id;

  public encodeRoot(root: DocRootType): RootJsonCrdtNode<Id> {
    return {
      type: 'root',
      id: this.encodeTimestamp(root.id),
      node: root.node ? this.encodeNode(root.node) : null,
    };
  }

  public encodeNode(node: JsonNode): JsonCrdtNode<Id> {
    if (node instanceof ObjectType) return this.encodeObj(node);
    else if (node instanceof ArrayType) return this.encodeArr(node);
    else if (node instanceof StringType) return this.encodeStr(node);
    else if (node instanceof ValueType) return this.encodeVal(node);
    else if (node instanceof ConstantType) return this.encodeConst(node);
    throw new Error('UNKNOWN_NODE');
  }

  public encodeObj(obj: ObjectType): ObjectJsonCrdtNode<Id> {
    const chunks: Record<string, ObjectJsonCrdtChunk<Id>> = {};
    for (const [key, entry] of obj.latest.entries())
      chunks[key] = {
        id: this.encodeTimestamp(entry.id),
        node: this.encodeNode(entry.node),
      };
    return {
      type: 'obj',
      id: this.encodeTimestamp(obj.id),
      chunks,
    };
  }

  public encodeArr(obj: ArrayType): ArrayJsonCrdtNode<Id> {
    const chunks: (ArrayJsonCrdtChunk<Id> | JsonCrdtRgaTombstone<Id>)[] = [];
    for (const chunk of obj.chunks()) chunks.push(this.encodeArrChunk(chunk));
    return {
      type: 'arr',
      id: this.encodeTimestamp(obj.id),
      chunks,
    };
  }

  public encodeArrChunk(chunk: ArrayChunk): ArrayJsonCrdtChunk<Id> | JsonCrdtRgaTombstone<Id> {
    if (chunk.deleted) {
      const tombstone: JsonCrdtRgaTombstone<Id> = {
        id: this.encodeTimestamp(chunk.id),
        span: chunk.deleted,
      };
      return tombstone;
    }
    const res: ArrayJsonCrdtChunk<Id> = {
      id: this.encodeTimestamp(chunk.id),
      nodes: chunk.nodes!.map((n) => this.encodeNode(n)),
    };
    return res;
  }

  public encodeStr(obj: StringType): StringJsonCrdtNode<Id> {
    const chunks: (StringJsonCrdtChunk<Id> | JsonCrdtRgaTombstone<Id>)[] = [];
    for (const chunk of obj.chunks()) chunks.push(this.encodeStrChunk(chunk));
    return {
      type: 'str',
      id: this.encodeTimestamp(obj.id),
      chunks,
    };
  }

  public encodeStrChunk(chunk: StringChunk): StringJsonCrdtChunk<Id> | JsonCrdtRgaTombstone<Id> {
    if (chunk.deleted) {
      const tombstone: JsonCrdtRgaTombstone<Id> = {
        id: this.encodeTimestamp(chunk.id),
        span: chunk.deleted,
      };
      return tombstone;
    }
    const res: StringJsonCrdtChunk<Id> = {
      id: this.encodeTimestamp(chunk.id),
      value: chunk.str!,
    };
    return res;
  }

  public encodeVal(obj: ValueType): ValueJsonCrdtNode<Id> {
    return {
      type: 'val',
      id: this.encodeTimestamp(obj.id),
      writeId: this.encodeTimestamp(obj.writeId),
      value: obj.value,
    };
  }

  public encodeConst(obj: ConstantType): ConstantJsonCrdtNode {
    return {
      type: 'const',
      value: obj.value,
    };
  }
}
