import * as nodes from '../../../nodes';
import {ClockEncoder} from '../../../../json-crdt-patch/codec/clock/ClockEncoder';
import {ITimestampStruct, Timestamp} from '../../../../json-crdt-patch/clock';
import {JsonCrdtDataType} from '../../../../json-crdt-patch/constants';
import {SESSION} from '../../../../json-crdt-patch/constants';
import type {Model} from '../../../model';

export class Encoder {
  protected time?: number;
  protected clock?: ClockEncoder;
  protected model!: Model;

  public encode(model: Model): unknown[] {
    this.model = model;
    const isServerTime = model.clock.sid === SESSION.SERVER;
    const clock = model.clock;
    const arr: unknown[] = isServerTime ? [clock.time] : [null];
    if (isServerTime) {
      this.time = clock.time;
    } else {
      this.clock = new ClockEncoder();
      this.clock.reset(model.clock);
    }
    this.encodeRoot(arr, model.root);
    if (!isServerTime) arr[0] = this.clock!.toJson();
    return arr;
  }

  protected ts(arr: unknown[], ts: ITimestampStruct): void {
    switch (ts.sid) {
      case SESSION.SYSTEM: {
        arr.push([ts.time]);
        break;
      }
      case SESSION.SERVER: {
        arr.push(this.time! - ts.time);
        break;
      }
      default: {
        const relativeId = this.clock!.append(ts);
        arr.push(-relativeId.sessionIndex, relativeId.timeDiff);
      }
    }
  }

  protected encodeRoot(arr: unknown[], root: nodes.RootNode): void {
    if (!root.val.time) arr.push(0);
    else this.cNode(arr, root.node());
  }

  protected cNode(arr: unknown[], node: nodes.JsonNode): void {
    // TODO: PERF: use switch with `node.constructor`.
    if (node instanceof nodes.ObjNode) return this.encodeObj(arr, node);
    else if (node instanceof nodes.ArrNode) return this.encodeArr(arr, node);
    else if (node instanceof nodes.StrNode) return this.encodeStr(arr, node);
    else if (node instanceof nodes.ValNode) return this.cVal(arr, node);
    else if (node instanceof nodes.VecNode) return this.cTup(arr, node);
    else if (node instanceof nodes.ConNode) return this.cConst(arr, node);
    else if (node instanceof nodes.BinNode) return this.encodeBin(arr, node);
    throw new Error('UNKNOWN_NODE');
  }

  protected encodeObj(arr: unknown[], obj: nodes.ObjNode): void {
    const res: unknown[] = [JsonCrdtDataType.obj];
    arr.push(res);
    this.ts(res, obj.id);
    obj.nodes((node, key) => {
      res.push(key);
      this.cNode(res, node);
    });
  }

  protected cTup(arr: unknown[], obj: nodes.VecNode): void {
    const res: unknown[] = [JsonCrdtDataType.vec];
    arr.push(res);
    this.ts(res, obj.id);
    const elements = obj.elements;
    const length = elements.length;
    const index = this.model.index;
    for (let i = 0; i < length; i++) {
      const elementId = elements[i];
      if (!elementId) res.push(0);
      else {
        const node = index.get(elementId)!;
        this.cNode(res, node);
      }
    }
  }

  protected encodeArr(arr: unknown[], obj: nodes.ArrNode): void {
    const res: unknown[] = [JsonCrdtDataType.arr, obj.size()];
    arr.push(res);
    this.ts(res, obj.id);
    const iterator = obj.iterator();
    let chunk;
    while ((chunk = iterator())) this.encodeArrChunk(res, chunk);
  }

  protected encodeArrChunk(arr: unknown[], chunk: nodes.ArrChunk): void {
    this.ts(arr, chunk.id);
    if (chunk.del) arr.push(chunk.span);
    else {
      const nodes: unknown[] = [];
      const index = this.model.index;
      for (const n of chunk.data!) this.cNode(nodes, index.get(n)!);
      arr.push(nodes);
    }
  }

  protected encodeStr(arr: unknown[], obj: nodes.StrNode): void {
    const res: unknown[] = [JsonCrdtDataType.str, obj.size()];
    arr.push(res);
    this.ts(res, obj.id);
    const iterator = obj.iterator();
    let chunk;
    while ((chunk = iterator())) this.encodeStrChunk(res, chunk as nodes.StrChunk);
  }

  protected encodeStrChunk(arr: unknown[], chunk: nodes.StrChunk): void {
    this.ts(arr, chunk.id);
    arr.push(chunk.del ? chunk.span : chunk.data!);
  }

  protected encodeBin(arr: unknown[], obj: nodes.BinNode): void {
    const res: unknown[] = [JsonCrdtDataType.bin, obj.size()];
    arr.push(res);
    this.ts(res, obj.id);
    const iterator = obj.iterator();
    let chunk;
    while ((chunk = iterator())) this.encodeBinChunk(res, chunk as nodes.BinChunk);
  }

  protected encodeBinChunk(arr: unknown[], chunk: nodes.BinChunk): void {
    this.ts(arr, chunk.id);
    arr.push(chunk.del ? chunk.span : chunk.data!);
  }

  protected cVal(arr: unknown[], obj: nodes.ValNode): void {
    const res: unknown[] = [JsonCrdtDataType.val];
    arr.push(res);
    this.ts(res, obj.id);
    this.cNode(res, obj.node());
  }

  protected cConst(arr: unknown[], obj: nodes.ConNode): void {
    const val = obj.val;
    const res: unknown[] = [];
    if (val instanceof Timestamp) {
      res.push(JsonCrdtDataType.con + 10);
      this.ts(res, obj.id);
      this.ts(res, val);
    } else {
      res.push(JsonCrdtDataType.con);
      this.ts(res, obj.id);
      if (val !== undefined) res.push(val);
    }
    arr.push(res);
  }
}
