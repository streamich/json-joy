import * as nodes from '../../../nodes';
import {fromBase64} from '../../../../util/base64/fromBase64';
import {ITimestampStruct, ts, VectorClock} from '../../../../json-crdt-patch/clock';
import {Model} from '../../../model';
import {SESSION} from '../../../../json-crdt-patch/constants';
import * as types from './types';

export class Decoder {
  public decode({time, root}: types.JsonCrdtSnapshot): Model {
    const isServerClock = typeof time === 'number';
    const doc = isServerClock ? Model.withServerClock(time) : Model.withLogicalClock(this.cClock(time));
    this.cRoot(doc, root);
    return doc;
  }

  protected cClock(timestamps: types.JsonCrdtLogicalTimestamp[]): VectorClock {
    const [stamp] = timestamps;
    const vectorClock = new VectorClock(stamp[0], stamp[1]);
    const length = timestamps.length;
    for (let i = 1; i < length; i++) {
      const stamp = timestamps[i];
      const [sessionId, time] = stamp;
      vectorClock.observe(ts(sessionId, time), 1);
    }
    return vectorClock;
  }

  protected cTs(stamp: types.JsonCrdtTimestamp): ITimestampStruct {
    const isServerClock = typeof stamp === 'number';
    return isServerClock ? ts(SESSION.SERVER, stamp) : ts(stamp[0], stamp[1]);
  }

  protected cRoot(doc: Model, {value}: types.ValueJsonCrdtNode): void {
    const val = value ? this.cNode(doc, value) : new nodes.ConNode(doc.clock.tick(0), null);
    const root = new nodes.RootNode(doc, val.id);
    doc.root = root;
  }

  protected cNode(doc: Model, node: types.JsonCrdtNode): nodes.JsonNode {
    switch (node.type) {
      case 'obj':
        return this.cObj(doc, node);
      case 'arr':
        return this.cArr(doc, node);
      case 'str':
        return this.cStr(doc, node);
      case 'val':
        return this.cVal(doc, node);
      case 'con':
        return this.cCon(doc, node);
      case 'vec':
        return this.cVec(doc, node);
      case 'bin':
        return this.cBin(doc, node);
    }
    throw new Error('UNKNOWN_NODE');
  }

  protected cObj(doc: Model, node: types.ObjectJsonCrdtNode): nodes.ObjNode {
    const id = this.cTs(node.id);
    const obj = new nodes.ObjNode(doc, id);
    const map = node.map;
    const keys = Object.keys(map);
    for (const key of keys) {
      const keyNode = map[key];
      obj.put(key, this.cNode(doc, keyNode).id);
    }
    doc.index.set(id, obj);
    return obj;
  }

  protected cVec(doc: Model, node: types.VectorJsonCrdtNode): nodes.VecNode {
    const id = this.cTs(node.id);
    const obj = new nodes.VecNode(doc, id);
    const elements = obj.elements;
    const map = node.map;
    const length = map.length;
    for (let i = 0; i < length; i++) {
      const component = map[i];
      if (!component) elements.push(undefined);
      else elements.push(this.cNode(doc, component).id);
    }
    doc.index.set(id, obj);
    return obj;
  }

  protected cArr(doc: Model, node: types.ArrayJsonCrdtNode): nodes.ArrNode {
    const id = this.cTs(node.id);
    const rga = new nodes.ArrNode(doc, id);
    const chunks = node.chunks;
    const length = chunks.length;
    if (length) {
      const self = this;
      let i = 0;
      rga.ingest(length, () => {
        const c = chunks[i++];
        const id = self.cTs(c.id);
        if (typeof (c as types.JsonCrdtRgaTombstone).span === 'number')
          return new nodes.ArrChunk(id, (c as types.JsonCrdtRgaTombstone).span, undefined);
        else {
          const ids = (c as types.ArrayJsonCrdtChunk).value.map((n) => this.cNode(doc, n).id);
          return new nodes.ArrChunk(id, ids.length, ids);
        }
      });
    }
    doc.index.set(id, rga);
    return rga;
  }

  protected cStr(doc: Model, node: types.StringJsonCrdtNode): nodes.StrNode {
    const id = this.cTs(node.id);
    const rga = new nodes.StrNode(id);
    const chunks = node.chunks;
    const length = chunks.length;
    if (length) {
      const self = this;
      let i = 0;
      rga.ingest(length, () => {
        const c = chunks[i++];
        const id = self.cTs(c.id);
        if (typeof (c as types.JsonCrdtRgaTombstone).span === 'number')
          return new nodes.StrChunk(id, (c as types.JsonCrdtRgaTombstone).span, '');
        else {
          const value = (c as types.StringJsonCrdtChunk).value;
          return new nodes.StrChunk(id, value.length, value);
        }
      });
    }
    doc.index.set(id, rga);
    return rga;
  }

  protected cBin(doc: Model, node: types.BinaryJsonCrdtNode): nodes.BinNode {
    const id = this.cTs(node.id);
    const rga = new nodes.BinNode(id);
    const chunks = node.chunks;
    const length = chunks.length;
    const self = this;
    if (length) {
      let i = 0;
      rga.ingest(length, () => {
        const c = chunks[i++];
        const id = self.cTs(c.id);
        if (typeof (c as types.JsonCrdtRgaTombstone).span === 'number')
          return new nodes.BinChunk(id, (c as types.JsonCrdtRgaTombstone).span, undefined);
        else {
          const value = (c as types.BinaryJsonCrdtChunk).value;
          const buf = fromBase64(value);
          return new nodes.BinChunk(id, buf.length, buf);
        }
      });
    }
    doc.index.set(id, rga);
    return rga;
  }

  protected cVal(doc: Model, node: types.ValueJsonCrdtNode): nodes.ValNode {
    const id = this.cTs(node.id);
    const val = this.cNode(doc, node.value);
    const obj = new nodes.ValNode(doc, id, val.id);
    doc.index.set(id, obj);
    return obj;
  }

  protected cCon(doc: Model, node: types.ConstantJsonCrdtNode): nodes.ConNode {
    const id = this.cTs(node.id);
    const val = node.timestamp ? this.cTs(node.value as types.JsonCrdtLogicalTimestamp) : node.value;
    const obj = new nodes.ConNode(id, val);
    doc.index.set(id, obj);
    return obj;
  }
}
