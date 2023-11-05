import {ArrayRga, ArrayChunk} from '../../../types/rga-array/ArrayRga';
import {BinaryRga, BinaryChunk} from '../../../types/rga-binary/BinaryRga';
import {Const} from '../../../types/con/Const';
import {JsonNode} from '../../../types';
import {ObjectLww} from '../../../types/lww-object/ObjectLww';
import {StringRga, StringChunk} from '../../../types/rga-string/StringRga';
import {toBase64} from '../../../../util/base64/toBase64';
import {ValueLww} from '../../../types/lww-value/ValueLww';
import {SESSION} from '../../../../json-crdt-patch/constants';
import {ITimestampStruct, IVectorClock, Timestamp} from '../../../../json-crdt-patch/clock';
import {Model} from '../../../model';
import type {
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
  JsonCrdtLogicalTimestamp,
  JsonCrdtServerTimestamp,
  JsonCrdtSnapshot,
  TupleJsonCrdtNode,
} from './types';
import {ArrayLww} from '../../../types/lww-array/ArrayLww';

export class Encoder {
  protected model!: Model;

  public encode(model: Model): JsonCrdtSnapshot {
    this.model = model;
    const clock = model.clock;
    const isServerClock = clock.sid === SESSION.SERVER;
    return {
      time: isServerClock ? clock.time : this.cClock(model.clock),
      root: this.cVal(model.root),
    };
  }

  public cClock(clock: IVectorClock): JsonCrdtLogicalTimestamp[] {
    const data: JsonCrdtLogicalTimestamp[] = [];
    const sessionId = clock.sid;
    const localTs = clock.peers.get(sessionId);
    if (!localTs) data.push([sessionId, clock.time]);
    for (const c of clock.peers.values()) data.push([c.sid, c.time]);
    return data;
  }

  public cTs(ts: ITimestampStruct): JsonCrdtLogicalTimestamp | JsonCrdtServerTimestamp {
    return ts.sid === SESSION.SERVER ? ts.time : [ts.sid, ts.time];
  }

  public cNode(node: JsonNode): JsonCrdtNode {
    if (node instanceof ObjectLww) return this.cObj(node);
    else if (node instanceof ArrayRga) return this.cArr(node);
    else if (node instanceof StringRga) return this.cStr(node);
    else if (node instanceof ValueLww) return this.cVal(node);
    else if (node instanceof Const) return this.cConst(node);
    else if (node instanceof BinaryRga) return this.cBin(node);
    else if (node instanceof ArrayLww) return this.cTup(node);
    throw new Error('UNKNOWN_NODE');
  }

  public cObj(obj: ObjectLww): ObjectJsonCrdtNode {
    const keys: Record<string, JsonCrdtNode> = {};
    obj.nodes((node, key) => {
      keys[key] = this.cNode(node);
    });
    return {
      type: 'obj',
      id: this.cTs(obj.id),
      keys,
    };
  }

  public cTup(obj: ArrayLww): TupleJsonCrdtNode {
    const components: TupleJsonCrdtNode['components'] = [];
    const elements = obj.elements;
    const length = elements.length;
    const index = this.model.index;
    for (let i = 0; i < length; i++) {
      const element = elements[i];
      if (element === undefined) components.push(null);
      else components.push(this.cNode(index.get(element)!));
    }
    return {
      type: 'tup',
      id: this.cTs(obj.id),
      components,
    };
  }

  public cArr(obj: ArrayRga): ArrayJsonCrdtNode {
    const chunks: (ArrayJsonCrdtChunk | JsonCrdtRgaTombstone)[] = [];
    const iterator = obj.iterator();
    let chunk;
    while ((chunk = iterator())) chunks.push(this.cArrChunk(chunk));
    return {
      type: 'arr',
      id: this.cTs(obj.id),
      chunks,
    };
  }

  public cArrChunk(chunk: ArrayChunk): ArrayJsonCrdtChunk | JsonCrdtRgaTombstone {
    if (chunk.del) {
      const tombstone: JsonCrdtRgaTombstone = {
        id: this.cTs(chunk.id),
        span: chunk.span,
      };
      return tombstone;
    }
    const index = this.model.index;
    const res: ArrayJsonCrdtChunk = {
      id: this.cTs(chunk.id),
      nodes: chunk.data!.map((n) => this.cNode(index.get(n)!)),
    };
    return res;
  }

  public cStr(obj: StringRga): StringJsonCrdtNode {
    const chunks: (StringJsonCrdtChunk | JsonCrdtRgaTombstone)[] = [];
    const iterator = obj.iterator();
    let chunk;
    while ((chunk = iterator())) chunks.push(this.cStrChunk(chunk as StringChunk));
    return {
      type: 'str',
      id: this.cTs(obj.id),
      chunks,
    };
  }

  public cStrChunk(chunk: StringChunk): StringJsonCrdtChunk | JsonCrdtRgaTombstone {
    if (chunk.del) {
      const tombstone: JsonCrdtRgaTombstone = {
        id: this.cTs(chunk.id),
        span: chunk.span,
      };
      return tombstone;
    }
    const res: StringJsonCrdtChunk = {
      id: this.cTs(chunk.id),
      value: chunk.data!,
    };
    return res;
  }

  public cBin(obj: BinaryRga): BinaryJsonCrdtNode {
    const chunks: (BinaryJsonCrdtChunk | JsonCrdtRgaTombstone)[] = [];
    const iterator = obj.iterator();
    let chunk;
    while ((chunk = iterator())) chunks.push(this.cBinChunk(chunk as BinaryChunk));
    return {
      type: 'bin',
      id: this.cTs(obj.id),
      chunks,
    };
  }

  public cBinChunk(chunk: BinaryChunk): BinaryJsonCrdtChunk | JsonCrdtRgaTombstone {
    if (chunk.del) {
      const tombstone: JsonCrdtRgaTombstone = {
        id: this.cTs(chunk.id),
        span: chunk.span,
      };
      return tombstone;
    }
    const res: StringJsonCrdtChunk = {
      id: this.cTs(chunk.id),
      value: toBase64(chunk.data!),
    };
    return res;
  }

  public cVal(obj: ValueLww): ValueJsonCrdtNode {
    return {
      type: 'val',
      id: this.cTs(obj.id),
      node: this.cNode(obj.node()),
    };
  }

  public cConst(obj: Const): ConstantJsonCrdtNode {
    const node: ConstantJsonCrdtNode = {
      type: 'const',
      id: this.cTs(obj.id),
    };
    const val = obj.val;
    if (val instanceof Timestamp) {
      node.timestamp = true;
      node.value = this.cTs(val);
    } else {
      if (val !== undefined) node.value = val;
    }
    return node;
  }
}
