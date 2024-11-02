import * as nodes from '../../../nodes';
import {ClockEncoder} from '../../../../json-crdt-patch/codec/clock/ClockEncoder';
import {type ITimestampStruct, Timestamp} from '../../../../json-crdt-patch/clock';
import {JsonCrdtDataType} from '../../../../json-crdt-patch/constants';
import {SESSION} from '../../../../json-crdt-patch/constants';
import type * as t from './types';
import type {Model} from '../../../model';

export class Encoder {
  protected time?: number;
  protected clock?: ClockEncoder;
  protected model!: Model;

  public encode(model: Model<any>): t.JsonCrdtCompactDocument {
    this.model = model;
    const isServerTime = model.clock.sid === SESSION.SERVER;
    const clock = model.clock;
    if (isServerTime) {
      this.time = clock.time;
    } else {
      this.clock = new ClockEncoder();
      this.clock.reset(model.clock);
    }
    const root = model.root;
    const doc: t.JsonCrdtCompactDocument = [0, !root.val.time ? 0 : this.cNode(root.node())];
    doc[0] = isServerTime ? this.time! : this.clock!.toJson();
    return doc;
  }

  protected ts(ts: ITimestampStruct): t.JsonCrdtCompactTimestamp {
    switch (ts.sid) {
      case SESSION.SYSTEM:
        return [ts.sid, ts.time];
      case SESSION.SERVER:
        return this.time! - ts.time;
      default: {
        const relativeId = this.clock!.append(ts);
        return [-relativeId.sessionIndex, relativeId.timeDiff];
      }
    }
  }

  protected cNode(node: nodes.JsonNode): t.JsonCrdtCompactNode {
    // TODO: PERF: use switch with `node.constructor`.
    if (node instanceof nodes.ObjNode) return this.cObj(node);
    else if (node instanceof nodes.ArrNode) return this.cArr(node);
    else if (node instanceof nodes.StrNode) return this.cStr(node);
    else if (node instanceof nodes.ValNode) return this.cVal(node);
    else if (node instanceof nodes.VecNode) return this.cVec(node);
    else if (node instanceof nodes.ConNode) return this.cCon(node);
    else if (node instanceof nodes.BinNode) return this.cBin(node);
    throw new Error('UNKNOWN_NODE');
  }

  protected cObj(obj: nodes.ObjNode): t.JsonCrdtCompactObj {
    const map: t.JsonCrdtCompactObj[2] = {};
    obj.nodes((child, key) => (map[key] = this.cNode(child)));
    const res: t.JsonCrdtCompactObj = [JsonCrdtDataType.obj, this.ts(obj.id), map];
    return res;
  }

  protected cVec(vec: nodes.VecNode): t.JsonCrdtCompactVec {
    const elements = vec.elements;
    const length = elements.length;
    const index = this.model.index;
    const map: t.JsonCrdtCompactVec[2] = [];
    for (let i = 0; i < length; i++) {
      const elementId = elements[i];
      if (!elementId) map.push(0);
      else {
        const node = index.get(elementId)!;
        map.push(this.cNode(node));
      }
    }
    const res: t.JsonCrdtCompactVec = [JsonCrdtDataType.vec, this.ts(vec.id), map];
    return res;
  }

  protected cArr(node: nodes.ArrNode): t.JsonCrdtCompactArr {
    const chunks: t.JsonCrdtCompactArr[2] = [];
    const index = this.model.index;
    for (let chunk = node.first(); chunk; chunk = node.next(chunk)) {
      const deleted = chunk.del;
      const span = chunk.span;
      const chunkIdEncoded = this.ts(chunk.id);
      if (deleted) {
        chunks.push([chunkIdEncoded, span]);
      } else {
        const nodeIds = chunk.data!;
        const nodes: t.JsonCrdtCompactArrChunk[1] = [];
        for (let i = 0; i < span; i++) nodes.push(this.cNode(index.get(nodeIds[i])!));
        chunks.push([chunkIdEncoded, nodes]);
      }
    }
    const res: t.JsonCrdtCompactArr = [JsonCrdtDataType.arr, this.ts(node.id), chunks];
    return res;
  }

  protected cStr(node: nodes.StrNode): t.JsonCrdtCompactStr {
    const chunks: t.JsonCrdtCompactStr[2] = [];
    for (let chunk = node.first(); chunk; chunk = node.next(chunk))
      chunks.push([this.ts(chunk.id), chunk.del ? chunk.span : chunk.data!] as
        | t.JsonCrdtCompactStrChunk
        | t.JsonCrdtCompactTombstone);
    const res: t.JsonCrdtCompactStr = [JsonCrdtDataType.str, this.ts(node.id), chunks];
    return res;
  }

  protected cBin(node: nodes.BinNode): t.JsonCrdtCompactBin {
    const chunks: t.JsonCrdtCompactBin[2] = [];
    for (let chunk = node.first(); chunk; chunk = node.next(chunk))
      chunks.push([this.ts(chunk.id), chunk.del ? chunk.span : chunk.data!] as
        | t.JsonCrdtCompactBinChunk
        | t.JsonCrdtCompactTombstone);
    const res: t.JsonCrdtCompactBin = [JsonCrdtDataType.bin, this.ts(node.id), chunks];
    return res;
  }

  protected cVal(node: nodes.ValNode): t.JsonCrdtCompactVal {
    const res: t.JsonCrdtCompactVal = [JsonCrdtDataType.val, this.ts(node.id), this.cNode(node.node())];
    return res;
  }

  protected cCon(node: nodes.ConNode): t.JsonCrdtCompactCon {
    const val = node.val;
    const res: t.JsonCrdtCompactCon = [JsonCrdtDataType.con, this.ts(node.id), val];
    if (val instanceof Timestamp) {
      res[2] = 0;
      const specialData = this.ts(val);
      res.push(specialData);
    } else if (val === undefined) {
      res[2] = 0;
      res.push(0);
    }
    return res;
  }
}
