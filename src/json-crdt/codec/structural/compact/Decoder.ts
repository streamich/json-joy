import * as nodes from '../../../nodes';
import {ClockDecoder} from '../../../../json-crdt-patch/codec/clock/ClockDecoder';
import {type ITimestampStruct, Timestamp} from '../../../../json-crdt-patch/clock';
import {Model, UNDEFINED} from '../../../model/Model';
import {JsonCrdtDataType, SESSION} from '../../../../json-crdt-patch/constants';
import type * as t from './types';

export class Decoder {
  protected time?: number;
  protected clockDecoder?: ClockDecoder;

  public decode(doc: t.JsonCrdtCompactDocument): Model {
    const [time, root] = doc;
    const isServerTime = typeof time === 'number';
    if (isServerTime) {
      this.time = time;
    } else {
      this.clockDecoder = ClockDecoder.fromArr(time as number[]);
    }
    const model = isServerTime
      ? Model.withServerClock(void 0, time as number)
      : Model.create(void 0, this.clockDecoder!.clock);
    const val = root ? this.decNode(model, root) : UNDEFINED;
    model.root = new nodes.RootNode(model, val.id);
    return model;
  }

  protected ts(x: t.JsonCrdtCompactTimestamp): ITimestampStruct {
    if (typeof x === 'number') {
      return new Timestamp(SESSION.SERVER, this.time! - x);
    } else {
      const [sid, time] = x as [number, number];
      if (sid < 0) {
        return this.clockDecoder!.decodeId(-sid, time);
      } else {
        return new Timestamp(sid, time);
      }
    }
  }

  protected decNode(model: Model, node: t.JsonCrdtCompactNode): nodes.JsonNode {
    switch (node[0]) {
      case JsonCrdtDataType.con:
        return this.decCon(model, node);
      case JsonCrdtDataType.val:
        return this.decVal(model, node);
      case JsonCrdtDataType.obj:
        return this.decObj(model, node);
      case JsonCrdtDataType.vec:
        return this.decVec(model, node);
      case JsonCrdtDataType.str:
        return this.decStr(model, node);
      case JsonCrdtDataType.bin:
        return this.decBin(model, node);
      case JsonCrdtDataType.arr:
        return this.decArr(model, node);
    }
    throw new Error('UNKNOWN_NODE');
  }

  protected decCon(doc: Model, node: t.JsonCrdtCompactCon): nodes.ConNode {
    const id = this.ts(node[1]);
    let data: unknown | undefined | Timestamp = node[2];
    if (node.length > 3) {
      const specialData = node[3] as unknown;
      if (!specialData) data = undefined;
      else data = this.ts(specialData as t.JsonCrdtCompactTimestamp);
    }
    const obj = new nodes.ConNode(id, data);
    doc.index.set(id, obj);
    return obj;
  }

  protected decVal(doc: Model, node: t.JsonCrdtCompactVal): nodes.ValNode {
    const id = this.ts(node[1]);
    const child = this.decNode(doc, node[2]);
    const obj = new nodes.ValNode(doc, id, child.id);
    doc.index.set(id, obj);
    return obj;
  }

  protected decObj(model: Model, node: t.JsonCrdtCompactObj): nodes.ObjNode {
    const id = this.ts(node[1]);
    const obj = new nodes.ObjNode(model, id);
    const map = node[2] as t.JsonCrdtCompactObj[2];
    const keys = Object.keys(map);
    const length = keys.length;
    for (let i = 0; i < length; i++) {
      const key = keys[i];
      const val = this.decNode(model, map[key]);
      obj.put(key, val.id);
    }
    model.index.set(id, obj);
    return obj;
  }

  protected decVec(model: Model, node: t.JsonCrdtCompactVec): nodes.VecNode {
    const id = this.ts(node[1]);
    const obj = new nodes.VecNode(model, id);
    const map = node[2] as t.JsonCrdtCompactVec[2];
    const elements = obj.elements;
    const length = map.length;
    for (let i = 0; i < length; i++) {
      const item = map[i];
      if (!item) elements.push(undefined);
      else {
        const child = this.decNode(model, item);
        elements.push(child.id);
      }
    }
    model.index.set(id, obj);
    return obj;
  }

  protected decStr(doc: Model, node: t.JsonCrdtCompactStr): nodes.StrNode {
    const id = this.ts(node[1]);
    const obj = new nodes.StrNode(id);
    const chunks = node[2] as t.JsonCrdtCompactStr[2];
    const size = chunks.length;
    let i = 0;
    obj.ingest(size, () => {
      const chunk = chunks[i++];
      const chunkId = this.ts(chunk[0]);
      const content = chunk[1];
      if (typeof content === 'number') return new nodes.StrChunk(chunkId, content, '');
      return new nodes.StrChunk(chunkId, (content as string).length, content as string);
    });
    doc.index.set(id, obj);
    return obj;
  }

  protected decBin(doc: Model, node: t.JsonCrdtCompactBin): nodes.BinNode {
    const id = this.ts(node[1]);
    const obj = new nodes.BinNode(id);
    const chunks = node[2] as t.JsonCrdtCompactBin[2];
    const size = chunks.length;
    let i = 0;
    obj.ingest(size, () => {
      const chunk = chunks[i++];
      const chunkId = this.ts(chunk[0]);
      const content = chunk[1];
      if (typeof content === 'number') return new nodes.BinChunk(chunkId, content, undefined);
      return new nodes.BinChunk(chunkId, content.length, content);
    });
    doc.index.set(id, obj);
    return obj;
  }

  protected decArr(doc: Model, node: t.JsonCrdtCompactArr): nodes.ArrNode {
    const id = this.ts(node[1]);
    const obj = new nodes.ArrNode(doc, id);
    const chunks = node[2] as t.JsonCrdtCompactArr[2];
    const size = chunks.length;
    let i = 0;
    obj.ingest(size, () => {
      const chunk = chunks[i++];
      const chunkId = this.ts(chunk[0]);
      const content = chunk[1];
      if (typeof content === 'number') return new nodes.ArrChunk(chunkId, content, undefined);
      const ids = (content as t.JsonCrdtCompactNode[]).map((c) => this.decNode(doc, c).id);
      return new nodes.ArrChunk(chunkId, content.length, ids);
    });
    doc.index.set(id, obj);
    return obj;
  }
}
