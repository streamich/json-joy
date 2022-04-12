import {ArrayChunk} from '../../types/rga-array/ArrayChunk';
import {ArrayType} from '../../types/rga-array/ArrayType';
import {BinaryChunk} from '../../types/rga-binary/BinaryChunk';
import {BinaryType} from '../../types/rga-binary/BinaryType';
import {ConstantType} from '../../types/const/ConstantType';
import {DocRootType} from '../../types/lww-doc-root/DocRootType';
import {FALSE, NULL, TRUE, UNDEFINED} from '../../constants';
import {fromBase64} from '../../../util/base64/decode';
import {ITimestamp, LogicalTimestamp, LogicalVectorClock, ServerVectorClock} from '../../../json-crdt-patch/clock';
import {JsonNode} from '../../types';
import {Model} from '../../model';
import {ObjectChunk} from '../../types/lww-object/ObjectChunk';
import {ObjectType} from '../../types/lww-object/ObjectType';
import {ORIGIN} from '../../../json-crdt-patch/constants';
import {StringChunk} from '../../types/rga-string/StringChunk';
import {StringType} from '../../types/rga-string/StringType';
import {ValueType} from '../../types/lww-value/ValueType';
import {
  RootJsonCrdtNode,
  JsonCrdtNode,
  ObjectJsonCrdtNode,
  ArrayJsonCrdtNode,
  ArrayJsonCrdtChunk,
  JsonCrdtRgaTombstone,
  ValueJsonCrdtNode,
  StringJsonCrdtNode,
  StringJsonCrdtChunk,
  ConstantJsonCrdtNode,
  BinaryJsonCrdtNode,
  BinaryJsonCrdtChunk,
  JsonCrdtSnapshot,
  JsonCrdtLogicalTimestamp,
  JsonCrdtTimestamp,
} from './types';

export class Decoder {
  public decode({time, root}: JsonCrdtSnapshot): Model {
    const isServerClock = typeof time === 'number';
    const doc = isServerClock
      ? Model.withServerClock(time)
      : Model.withLogicalClock(this.decodeClock(time));
    this.decodeRoot(doc, root);
    return doc;
  }

  protected decodeClock(timestamps: JsonCrdtLogicalTimestamp[]): LogicalVectorClock {
    const [ts] = timestamps;
    const vectorClock = new LogicalVectorClock(ts[0], ts[1]);
    const length = timestamps.length;
    for (let i = 0; i < length; i++) {
      const ts = timestamps[i];
      const [sessionId, time] = ts;
      vectorClock.observe(new LogicalTimestamp(sessionId, time), 1);
    }
    return vectorClock;
  }

  protected decodeTimestamp(ts: JsonCrdtTimestamp): ITimestamp {
    const isServerClock = typeof ts === 'number';
    return isServerClock
      ? new ServerVectorClock(ts)
      : new LogicalTimestamp(ts[0], ts[1]);
  }

  protected decodeRoot(doc: Model, {id, node}: RootJsonCrdtNode): void {
    const ts = this.decodeTimestamp(id);
    const jsonNode = node ? this.decodeNode(doc, node) : null;
    const root = new DocRootType(doc, ts, jsonNode);
    doc.root = root;
  }

  protected decodeNode(doc: Model, node: JsonCrdtNode): JsonNode {
    switch (node.type) {
      case 'obj':
        return this.decodeObj(doc, node);
      case 'arr':
        return this.decodeArr(doc, node);
      case 'str':
        return this.decodeStr(doc, node);
      case 'val':
        return this.decodeVal(doc, node);
      case 'const':
        return this.decodeConst(doc, node);
      case 'bin':
        return this.decodeBin(doc, node);
    }
    throw new Error('UNKNOWN_NODE');
  }

  protected decodeObj(doc: Model, node: ObjectJsonCrdtNode): ObjectType {
    const id = this.decodeTimestamp(node.id);
    const obj = new ObjectType(doc, id);
    const keys = Object.keys(node.chunks);
    for (const key of keys) {
      const val = node.chunks[key];
      obj.putChunk(key, new ObjectChunk(this.decodeTimestamp(val.id), this.decodeNode(doc, val.node)));
    }
    doc.nodes.index(obj);
    return obj;
  }

  protected decodeArr(doc: Model, node: ArrayJsonCrdtNode): ArrayType {
    const obj = new ArrayType(doc, this.decodeTimestamp(node.id));
    for (const c of node.chunks) obj.append(this.decodeArrChunk(doc, c));
    doc.nodes.index(obj);
    return obj;
  }

  protected decodeArrChunk(doc: Model, c: ArrayJsonCrdtChunk | JsonCrdtRgaTombstone): ArrayChunk {
    const id = this.decodeTimestamp(c.id);
    if (typeof (c as JsonCrdtRgaTombstone).span === 'number') {
      const chunk = new ArrayChunk(id, undefined);
      chunk.deleted = (c as JsonCrdtRgaTombstone).span;
      return chunk;
    } else
      return new ArrayChunk(
        id,
        (c as ArrayJsonCrdtChunk).nodes.map((n) => this.decodeNode(doc, n)),
      );
  }

  protected decodeStr(doc: Model, node: StringJsonCrdtNode): StringType {
    const obj = new StringType(doc, this.decodeTimestamp(node.id));
    for (const c of node.chunks) obj.append(this.decodeStrChunk(doc, c));
    doc.nodes.index(obj);
    return obj;
  }

  protected decodeStrChunk(doc: Model, c: StringJsonCrdtChunk | JsonCrdtRgaTombstone): StringChunk {
    const id = this.decodeTimestamp(c.id);
    if (typeof (c as JsonCrdtRgaTombstone).span === 'number') {
      const chunk = new StringChunk(id, undefined);
      chunk.deleted = (c as JsonCrdtRgaTombstone).span;
      return chunk;
    } else return new StringChunk(id, (c as StringJsonCrdtChunk).value);
  }

  protected decodeBin(doc: Model, node: BinaryJsonCrdtNode): BinaryType {
    const obj = new BinaryType(doc, this.decodeTimestamp(node.id));
    for (const c of node.chunks) obj.append(this.decodeBinChunk(doc, c));
    doc.nodes.index(obj);
    return obj;
  }

  protected decodeBinChunk(doc: Model, c: BinaryJsonCrdtChunk | JsonCrdtRgaTombstone): BinaryChunk {
    const id = this.decodeTimestamp(c.id);
    if (typeof (c as JsonCrdtRgaTombstone).span === 'number') {
      const chunk = new BinaryChunk(id, undefined);
      chunk.deleted = (c as JsonCrdtRgaTombstone).span;
      return chunk;
    } else {
      const data = fromBase64((c as StringJsonCrdtChunk).value);
      return new BinaryChunk(id, data);
    }
  }

  protected decodeVal(doc: Model, node: ValueJsonCrdtNode): ValueType {
    const obj = new ValueType(this.decodeTimestamp(node.id), this.decodeTimestamp(node.writeId), node.value);
    doc.nodes.index(obj);
    return obj;
  }

  protected decodeConst(doc: Model, node: ConstantJsonCrdtNode): ConstantType {
    switch (node.value) {
      case null:
        return NULL;
      case true:
        return TRUE;
      case false:
        return FALSE;
      case undefined:
        return UNDEFINED;
    }
    return new ConstantType(ORIGIN, node.value);
  }
}
