import {ArrayChunk} from '../../types/rga-array/ArrayChunk';
import {ArrayType} from '../../types/rga-array/ArrayType';
import {BinaryChunk} from '../../types/rga-binary/BinaryChunk';
import {BinaryType} from '../../types/rga-binary/BinaryType';
import {ConstantType} from '../../types/const/ConstantType';
import {DocRootType} from '../../types/lww-doc-root/DocRootType';
import {JsonNode} from '../../types';
import {ObjectType} from '../../types/lww-object/ObjectType';
import {StringChunk} from '../../types/rga-string/StringChunk';
import {StringType} from '../../types/rga-string/StringType';
import {toBase64} from '../../../util/base64/encode';
import {ValueType} from '../../types/lww-value/ValueType';
import {SESSION} from '../../../json-crdt-patch/constants';
import type {ITimestamp, IVectorClock} from '../../../json-crdt-patch/clock';
import type {Model} from '../../model';
import type {
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
  BinaryJsonCrdtNode,
  BinaryJsonCrdtChunk,
  JsonCrdtLogicalTimestamp,
  JsonCrdtServerTimestamp,
  JsonCrdtSnapshot,
} from './types';

export class Encoder {
  public encode(model: Model): JsonCrdtSnapshot {
    const clock = model.clock;
    const isServerClock = clock.getSessionId() === SESSION.SERVER;
    return {
      time: isServerClock ? clock.time : this.encodeClock(model.clock),
      root: this.encodeRoot(model.root),
    };
  }

  public encodeClock(clock: IVectorClock): JsonCrdtLogicalTimestamp[] {
    const data: JsonCrdtLogicalTimestamp[] = [];
    const sessionId = clock.getSessionId();
    const localTs = clock.clocks.get(sessionId);
    if (!localTs) data.push([sessionId, clock.time]);
    for (const c of clock.clocks.values()) data.push([c.getSessionId(), c.time]);
    return data;
  }

  public encodeTimestamp(ts: ITimestamp): JsonCrdtLogicalTimestamp | JsonCrdtServerTimestamp {
    return ts.getSessionId() === SESSION.SERVER
      ? ts.time
      : [ts.getSessionId(), ts.time];
  }

  public encodeRoot(root: DocRootType): RootJsonCrdtNode {
    return {
      type: 'root',
      id: this.encodeTimestamp(root.id),
      node: root.node ? this.encodeNode(root.node) : null,
    };
  }

  public encodeNode(node: JsonNode): JsonCrdtNode {
    if (node instanceof ObjectType) return this.encodeObj(node);
    else if (node instanceof ArrayType) return this.encodeArr(node);
    else if (node instanceof StringType) return this.encodeStr(node);
    else if (node instanceof ValueType) return this.encodeVal(node);
    else if (node instanceof ConstantType) return this.encodeConst(node);
    else if (node instanceof BinaryType) return this.encodeBin(node);
    throw new Error('UNKNOWN_NODE');
  }

  public encodeObj(obj: ObjectType): ObjectJsonCrdtNode {
    const chunks: Record<string, ObjectJsonCrdtChunk> = {};
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

  public encodeArr(obj: ArrayType): ArrayJsonCrdtNode {
    const chunks: (ArrayJsonCrdtChunk | JsonCrdtRgaTombstone)[] = [];
    for (const chunk of obj.chunks()) chunks.push(this.encodeArrChunk(chunk));
    return {
      type: 'arr',
      id: this.encodeTimestamp(obj.id),
      chunks,
    };
  }

  public encodeArrChunk(chunk: ArrayChunk): ArrayJsonCrdtChunk | JsonCrdtRgaTombstone {
    if (chunk.deleted) {
      const tombstone: JsonCrdtRgaTombstone = {
        id: this.encodeTimestamp(chunk.id),
        span: chunk.deleted,
      };
      return tombstone;
    }
    const res: ArrayJsonCrdtChunk = {
      id: this.encodeTimestamp(chunk.id),
      nodes: chunk.nodes!.map((n) => this.encodeNode(n)),
    };
    return res;
  }

  public encodeStr(obj: StringType): StringJsonCrdtNode {
    const chunks: (StringJsonCrdtChunk | JsonCrdtRgaTombstone)[] = [];
    for (const chunk of obj.chunks()) chunks.push(this.encodeStrChunk(chunk));
    return {
      type: 'str',
      id: this.encodeTimestamp(obj.id),
      chunks,
    };
  }

  public encodeStrChunk(chunk: StringChunk): StringJsonCrdtChunk | JsonCrdtRgaTombstone {
    if (chunk.deleted) {
      const tombstone: JsonCrdtRgaTombstone = {
        id: this.encodeTimestamp(chunk.id),
        span: chunk.deleted,
      };
      return tombstone;
    }
    const res: StringJsonCrdtChunk = {
      id: this.encodeTimestamp(chunk.id),
      value: chunk.str!,
    };
    return res;
  }

  public encodeBin(obj: BinaryType): BinaryJsonCrdtNode {
    const chunks: (BinaryJsonCrdtChunk | JsonCrdtRgaTombstone)[] = [];
    for (const chunk of obj.chunks()) chunks.push(this.encodeBinChunk(chunk));
    return {
      type: 'bin',
      id: this.encodeTimestamp(obj.id),
      chunks,
    };
  }

  public encodeBinChunk(chunk: BinaryChunk): BinaryJsonCrdtChunk | JsonCrdtRgaTombstone {
    if (chunk.deleted) {
      const tombstone: JsonCrdtRgaTombstone = {
        id: this.encodeTimestamp(chunk.id),
        span: chunk.deleted,
      };
      return tombstone;
    }
    const res: BinaryJsonCrdtChunk = {
      id: this.encodeTimestamp(chunk.id),
      value: toBase64(chunk.buf!),
    };
    return res;
  }

  public encodeVal(obj: ValueType): ValueJsonCrdtNode {
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
