import * as nodes from '../../../nodes';
import {toBase64} from '@jsonjoy.com/base64/lib/toBase64';
import {SESSION} from '../../../../json-crdt-patch/constants';
import {type ITimestampStruct, type IClockVector, Timestamp} from '../../../../json-crdt-patch/clock';
import type {Model} from '../../../model';
import type * as types from './types';
import type {Chunk} from '../../../nodes/rga';

export class Encoder {
  protected model!: Model;

  public encode(model: Model<any>): types.JsonCrdtVerboseDocument {
    this.model = model;
    const clock = model.clock;
    const isServerClock = clock.sid === SESSION.SERVER;
    return {
      time: isServerClock ? clock.time : this.cClock(model.clock),
      root: this.cVal(model.root),
    };
  }

  public cClock(clock: IClockVector): types.JsonCrdtVerboseLogicalTimestamp[] {
    const data: types.JsonCrdtVerboseLogicalTimestamp[] = [];
    const sessionId = clock.sid;
    const localTs = clock.peers.get(sessionId);
    if (!localTs) data.push([sessionId, clock.time]);
    for (const c of clock.peers.values()) data.push([c.sid, c.time]);
    return data;
  }

  public cTs(ts: ITimestampStruct): types.JsonCrdtVerboseLogicalTimestamp | types.JsonCrdtVerboseServerTimestamp {
    return ts.sid === SESSION.SERVER ? ts.time : [ts.sid, ts.time];
  }

  public cNode(node: nodes.JsonNode): types.JsonCrdtNode {
    if (node instanceof nodes.ObjNode) return this.cObj(node);
    else if (node instanceof nodes.ArrNode) return this.cArr(node);
    else if (node instanceof nodes.StrNode) return this.cStr(node);
    else if (node instanceof nodes.ValNode) return this.cVal(node);
    else if (node instanceof nodes.ConNode) return this.cCon(node);
    else if (node instanceof nodes.BinNode) return this.cBin(node);
    else if (node instanceof nodes.VecNode) return this.cVec(node);
    throw new Error('UNKNOWN_NODE');
  }

  public cObj(obj: nodes.ObjNode): types.JsonCrdtVerboseObj {
    const map: Record<string, types.JsonCrdtNode> = {};
    obj.nodes((node, key) => {
      map[key] = this.cNode(node);
    });
    return {
      type: 'obj',
      id: this.cTs(obj.id),
      map,
    };
  }

  public cVec(obj: nodes.VecNode): types.JsonCrdtVerboseVec {
    const map: types.JsonCrdtVerboseVec['map'] = [];
    const elements = obj.elements;
    const length = elements.length;
    const index = this.model.index;
    for (let i = 0; i < length; i++) {
      const element = elements[i];
      if (element === undefined) map.push(null);
      else map.push(this.cNode(index.get(element)!));
    }
    return {
      type: 'vec',
      id: this.cTs(obj.id),
      map,
    };
  }

  public cArr(obj: nodes.ArrNode): types.JsonCrdtVerboseArr {
    const chunks: (types.JsonCrdtVerboseArrChunk | types.JsonCrdtVerboseTombstone)[] = [];
    const iterator = obj.iterator();
    let chunk: Chunk<ITimestampStruct[]> | undefined;
    while ((chunk = iterator())) chunks.push(this.cArrChunk(chunk));
    return {
      type: 'arr',
      id: this.cTs(obj.id),
      chunks,
    };
  }

  public cArrChunk(chunk: nodes.ArrChunk): types.JsonCrdtVerboseArrChunk | types.JsonCrdtVerboseTombstone {
    if (chunk.del) {
      const tombstone: types.JsonCrdtVerboseTombstone = {
        id: this.cTs(chunk.id),
        span: chunk.span,
      };
      return tombstone;
    }
    const index = this.model.index;
    const res: types.JsonCrdtVerboseArrChunk = {
      id: this.cTs(chunk.id),
      value: chunk.data!.map((n) => this.cNode(index.get(n)!)),
    };
    return res;
  }

  public cStr(obj: nodes.StrNode): types.JsonCrdtVerboseStr {
    const chunks: (types.JsonCrdtVerboseStrChunk | types.JsonCrdtVerboseTombstone)[] = [];
    const iterator = obj.iterator();
    let chunk: ReturnType<typeof iterator>;
    while ((chunk = iterator())) chunks.push(this.cStrChunk(chunk as nodes.StrChunk));
    return {
      type: 'str',
      id: this.cTs(obj.id),
      chunks,
    };
  }

  public cStrChunk(chunk: nodes.StrChunk): types.JsonCrdtVerboseStrChunk | types.JsonCrdtVerboseTombstone {
    if (chunk.del) {
      const tombstone: types.JsonCrdtVerboseTombstone = {
        id: this.cTs(chunk.id),
        span: chunk.span,
      };
      return tombstone;
    }
    const res: types.JsonCrdtVerboseStrChunk = {
      id: this.cTs(chunk.id),
      value: chunk.data!,
    };
    return res;
  }

  public cBin(obj: nodes.BinNode): types.JsonCrdtVerboseBin {
    const chunks: (types.JsonCrdtVerboseBinChunk | types.JsonCrdtVerboseTombstone)[] = [];
    const iterator = obj.iterator();
    let chunk: ReturnType<typeof iterator>;
    while ((chunk = iterator())) chunks.push(this.cBinChunk(chunk as nodes.BinChunk));
    return {
      type: 'bin',
      id: this.cTs(obj.id),
      chunks,
    };
  }

  public cBinChunk(chunk: nodes.BinChunk): types.JsonCrdtVerboseBinChunk | types.JsonCrdtVerboseTombstone {
    if (chunk.del) {
      const tombstone: types.JsonCrdtVerboseTombstone = {
        id: this.cTs(chunk.id),
        span: chunk.span,
      };
      return tombstone;
    }
    const res: types.JsonCrdtVerboseStrChunk = {
      id: this.cTs(chunk.id),
      value: toBase64(chunk.data!),
    };
    return res;
  }

  public cVal(obj: nodes.ValNode): types.JsonCrdtVerboseVal {
    return {
      type: 'val',
      id: this.cTs(obj.id),
      value: this.cNode(obj.node()),
    };
  }

  public cCon(obj: nodes.ConNode): types.JsonCrdtVerboseCon {
    const node: types.JsonCrdtVerboseCon = {
      type: 'con',
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
