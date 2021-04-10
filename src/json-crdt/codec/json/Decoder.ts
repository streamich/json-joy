import {LogicalTimestamp, VectorClock} from '../../../json-crdt-patch/clock';
import {ORIGIN} from '../../../json-crdt-patch/constants';
import {FALSE, NULL, TRUE, UNDEFINED} from '../../constants';
import {Document} from '../../document';
import {JsonNode} from '../../types';
import {ConstantType} from '../../types/const/ConstantType';
import {DocRootType} from '../../types/lww-doc-root/DocRootType';
import {ObjectChunk} from '../../types/lww-object/ObjectChunk';
import {ObjectType} from '../../types/lww-object/ObjectType';
import {ValueType} from '../../types/lww-value/ValueType';
import {ArrayChunk} from '../../types/rga-array/ArrayChunk';
import {ArrayType} from '../../types/rga-array/ArrayType';
import {StringChunk} from '../../types/rga-string/StringChunk';
import {StringType} from '../../types/rga-string/StringType';
import {JsonCrdtSnapshot, JsonCrdtTimestamp, RootJsonCrdtNode, JsonCrdtNode, ObjectJsonCrdtNode, ArrayJsonCrdtNode, ArrayJsonCrdtChunk, JsonCrdtRgaTombstone, ValueJsonCrdtNode, StringJsonCrdtNode, StringJsonCrdtChunk, ConstantJsonCrdtNode} from './types';

export class Decoder {
  public decode({clock, root}: JsonCrdtSnapshot): Document {
    const vectorClock = this.decodeClock(clock);
    const doc = new Document(vectorClock);
    this.decodeRoot(doc, root);
    return doc;
  }

  protected decodeClock(timestamps: JsonCrdtTimestamp[]): VectorClock {
    const [ts] = timestamps;
    const vectorClock = new VectorClock(ts[0], ts[1]);
    const length = timestamps.length;
    for (let i = 1; i < length; i++) {
      const ts = timestamps[i];
      const [sessionId, time] = ts;
      vectorClock.clocks.set(sessionId, new LogicalTimestamp(sessionId, time));
    }
    return vectorClock;
  }

  protected decodeTimestamp([sessionId, time]: JsonCrdtTimestamp): LogicalTimestamp {
    return new LogicalTimestamp(sessionId, time);
  }

  protected decodeRoot(doc: Document, {id, node}: RootJsonCrdtNode): void {
    const ts = this.decodeTimestamp(id);
    const jsonNode = node ? this.decodeNode(doc, node) : null;
    const root = new DocRootType(doc, ts, jsonNode);
    doc.root = root;
  }

  protected decodeNode(doc: Document, node: JsonCrdtNode): JsonNode {
    switch (node.type) {
      case 'obj': return this.decodeObj(doc, node);
      case 'arr': return this.decodeArr(doc, node);
      case 'str': return this.decodeStr(doc, node);
      case 'val': return this.decodeVal(doc, node);
      case 'const': return this.decodeConst(doc, node);
    }
    throw new Error('UNKNOWN_NODE');
  }

  protected decodeObj(doc: Document, node: ObjectJsonCrdtNode): ObjectType {
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

  protected decodeArr(doc: Document, node: ArrayJsonCrdtNode): ArrayType {
    const obj = new ArrayType(doc, this.decodeTimestamp(node.id));
    for (const c of node.chunks) obj.append(this.decodeArrChunk(doc, c));
    doc.nodes.index(obj);
    return obj;
  }

  protected decodeArrChunk(doc: Document, c: ArrayJsonCrdtChunk | JsonCrdtRgaTombstone): ArrayChunk {
    const id = this.decodeTimestamp(c.id);
    if (typeof (c as JsonCrdtRgaTombstone).span === 'number') {
      const chunk = new ArrayChunk(id, undefined);
      chunk.deleted = (c as JsonCrdtRgaTombstone).span;
      return chunk;
    } else return new ArrayChunk(id, (c as ArrayJsonCrdtChunk).nodes.map(n => this.decodeNode(doc, n)));
  }

  protected decodeStr(doc: Document, node: StringJsonCrdtNode): StringType {
    const obj = new StringType(doc, this.decodeTimestamp(node.id));
    for (const c of node.chunks) obj.append(this.decodeStrChunk(doc, c));
    doc.nodes.index(obj);
    return obj;
  }

  protected decodeStrChunk(doc: Document, c: StringJsonCrdtChunk | JsonCrdtRgaTombstone): StringChunk {
    const id = this.decodeTimestamp(c.id);
    if (typeof (c as JsonCrdtRgaTombstone).span === 'number') {
      const chunk = new StringChunk(id, undefined);
      chunk.deleted = (c as JsonCrdtRgaTombstone).span;
      return chunk;
    } else return new StringChunk(id, (c as StringJsonCrdtChunk).value);
  }

  protected decodeVal(doc: Document, node: ValueJsonCrdtNode): ValueType {
    const obj = new ValueType(this.decodeTimestamp(node.id), this.decodeTimestamp(node.writeId), node.value);
    doc.nodes.index(obj);
    return obj;
  }

  protected decodeConst(doc: Document, node: ConstantJsonCrdtNode): ConstantType {
    switch (node.value) {
      case null: return NULL;
      case true: return TRUE;
      case false: return FALSE;
      case undefined: return UNDEFINED;
    }
    return new ConstantType(ORIGIN, node.value);
  }
}
