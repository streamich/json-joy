import {ArrayChunk} from '../../types/rga-array/ArrayChunk';
import {ArrayType} from '../../types/rga-array/ArrayType';
import {BinaryChunk} from '../../types/rga-binary/BinaryChunk';
import {BinaryType} from '../../types/rga-binary/BinaryType';
import {ConstantType} from '../../types/const/ConstantType';
import {DocRootType} from '../../types/lww-doc-root/DocRootType';
import {FALSE, NULL, TRUE, UNDEFINED} from '../../constants';
import {fromBase64} from '../../../util/base64/decode';
import {ITimestamp} from '../../../json-crdt-patch/clock';
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
} from './types';

export abstract class AbstractDecoder<Id> {
  protected abstract decodeTimestamp(id: Id): ITimestamp;

  protected decodeRoot(doc: Model, {id, node}: RootJsonCrdtNode<Id>): void {
    const ts = this.decodeTimestamp(id);
    const jsonNode = node ? this.decodeNode(doc, node) : null;
    const root = new DocRootType(doc, ts, jsonNode);
    doc.root = root;
  }

  protected decodeNode(doc: Model, node: JsonCrdtNode<Id>): JsonNode {
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

  protected decodeObj(doc: Model, node: ObjectJsonCrdtNode<Id>): ObjectType {
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

  protected decodeArr(doc: Model, node: ArrayJsonCrdtNode<Id>): ArrayType {
    const obj = new ArrayType(doc, this.decodeTimestamp(node.id));
    for (const c of node.chunks) obj.append(this.decodeArrChunk(doc, c));
    doc.nodes.index(obj);
    return obj;
  }

  protected decodeArrChunk(doc: Model, c: ArrayJsonCrdtChunk<Id> | JsonCrdtRgaTombstone<Id>): ArrayChunk {
    const id = this.decodeTimestamp(c.id);
    if (typeof (c as JsonCrdtRgaTombstone<Id>).span === 'number') {
      const chunk = new ArrayChunk(id, undefined);
      chunk.deleted = (c as JsonCrdtRgaTombstone<Id>).span;
      return chunk;
    } else
      return new ArrayChunk(
        id,
        (c as ArrayJsonCrdtChunk<Id>).nodes.map((n) => this.decodeNode(doc, n)),
      );
  }

  protected decodeStr(doc: Model, node: StringJsonCrdtNode<Id>): StringType {
    const obj = new StringType(doc, this.decodeTimestamp(node.id));
    for (const c of node.chunks) obj.append(this.decodeStrChunk(doc, c));
    doc.nodes.index(obj);
    return obj;
  }

  protected decodeStrChunk(doc: Model, c: StringJsonCrdtChunk<Id> | JsonCrdtRgaTombstone<Id>): StringChunk {
    const id = this.decodeTimestamp(c.id);
    if (typeof (c as JsonCrdtRgaTombstone<Id>).span === 'number') {
      const chunk = new StringChunk(id, undefined);
      chunk.deleted = (c as JsonCrdtRgaTombstone<Id>).span;
      return chunk;
    } else return new StringChunk(id, (c as StringJsonCrdtChunk<Id>).value);
  }

  protected decodeBin(doc: Model, node: BinaryJsonCrdtNode<Id>): BinaryType {
    const obj = new BinaryType(doc, this.decodeTimestamp(node.id));
    for (const c of node.chunks) obj.append(this.decodeBinChunk(doc, c));
    doc.nodes.index(obj);
    return obj;
  }

  protected decodeBinChunk(doc: Model, c: BinaryJsonCrdtChunk<Id> | JsonCrdtRgaTombstone<Id>): BinaryChunk {
    const id = this.decodeTimestamp(c.id);
    if (typeof (c as JsonCrdtRgaTombstone<Id>).span === 'number') {
      const chunk = new BinaryChunk(id, undefined);
      chunk.deleted = (c as JsonCrdtRgaTombstone<Id>).span;
      return chunk;
    } else {
      const data = fromBase64((c as StringJsonCrdtChunk<Id>).value);
      return new BinaryChunk(id, data);
    }
  }

  protected decodeVal(doc: Model, node: ValueJsonCrdtNode<Id>): ValueType {
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
