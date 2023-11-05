import {ArrayRga, ArrayChunk} from '../../../types/rga-array/ArrayRga';
import {BinaryRga, BinaryChunk} from '../../../types/rga-binary/BinaryRga';
import {ClockEncoder} from '../../../../json-crdt-patch/codec/clock/ClockEncoder';
import {Const} from '../../../types/con/Const';
import {RootLww} from '../../../types/lww-root/RootLww';
import {ITimestampStruct, Timestamp} from '../../../../json-crdt-patch/clock';
import {JsonNode} from '../../../types';
import {ObjectLww} from '../../../types/lww-object/ObjectLww';
import {SESSION} from '../../../../json-crdt-patch/constants';
import {StringRga, StringChunk} from '../../../types/rga-string/StringRga';
import {Code} from '../../../../json-crdt-patch/codec/compact/constants';
import {ValueLww} from '../../../types/lww-value/ValueLww';
import type {Model} from '../../../model';
import {ArrayLww} from '../../../types/lww-array/ArrayLww';

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

  protected encodeRoot(arr: unknown[], root: RootLww): void {
    if (!root.val.time) arr.push(0);
    else this.cNode(arr, root.node());
  }

  protected cNode(arr: unknown[], node: JsonNode): void {
    // TODO: PERF: use switch with `node.constructor`.
    if (node instanceof ObjectLww) return this.encodeObj(arr, node);
    else if (node instanceof ArrayRga) return this.encodeArr(arr, node);
    else if (node instanceof StringRga) return this.encodeStr(arr, node);
    else if (node instanceof ValueLww) return this.cVal(arr, node);
    else if (node instanceof ArrayLww) return this.cTup(arr, node);
    else if (node instanceof Const) return this.cConst(arr, node);
    else if (node instanceof BinaryRga) return this.encodeBin(arr, node);
    throw new Error('UNKNOWN_NODE');
  }

  protected encodeObj(arr: unknown[], obj: ObjectLww): void {
    const res: unknown[] = [Code.MakeObject];
    arr.push(res);
    this.ts(res, obj.id);
    obj.nodes((node, key) => {
      res.push(key);
      this.cNode(res, node);
    });
  }

  protected cTup(arr: unknown[], obj: ArrayLww): void {
    const res: unknown[] = [Code.MakeTuple];
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

  protected encodeArr(arr: unknown[], obj: ArrayRga): void {
    const res: unknown[] = [Code.MakeArray, obj.size()];
    arr.push(res);
    this.ts(res, obj.id);
    const iterator = obj.iterator();
    let chunk;
    while ((chunk = iterator())) this.encodeArrChunk(res, chunk);
  }

  protected encodeArrChunk(arr: unknown[], chunk: ArrayChunk): void {
    this.ts(arr, chunk.id);
    if (chunk.del) arr.push(chunk.span);
    else {
      const nodes: unknown[] = [];
      const index = this.model.index;
      for (const n of chunk.data!) this.cNode(nodes, index.get(n)!);
      arr.push(nodes);
    }
  }

  protected encodeStr(arr: unknown[], obj: StringRga): void {
    const res: unknown[] = [Code.MakeString, obj.size()];
    arr.push(res);
    this.ts(res, obj.id);
    const iterator = obj.iterator();
    let chunk;
    while ((chunk = iterator())) this.encodeStrChunk(res, chunk as StringChunk);
  }

  protected encodeStrChunk(arr: unknown[], chunk: StringChunk): void {
    this.ts(arr, chunk.id);
    arr.push(chunk.del ? chunk.span : chunk.data!);
  }

  protected encodeBin(arr: unknown[], obj: BinaryRga): void {
    const res: unknown[] = [Code.MakeBinary, obj.size()];
    arr.push(res);
    this.ts(res, obj.id);
    const iterator = obj.iterator();
    let chunk;
    while ((chunk = iterator())) this.encodeBinChunk(res, chunk as BinaryChunk);
  }

  protected encodeBinChunk(arr: unknown[], chunk: BinaryChunk): void {
    this.ts(arr, chunk.id);
    arr.push(chunk.del ? chunk.span : chunk.data!);
  }

  protected cVal(arr: unknown[], obj: ValueLww): void {
    const res: unknown[] = [Code.MakeValue];
    arr.push(res);
    this.ts(res, obj.id);
    this.cNode(res, obj.node());
  }

  protected cConst(arr: unknown[], obj: Const): void {
    const val = obj.val;
    const res: unknown[] = [];
    if (val instanceof Timestamp) {
      res.push(Code.MakeConstId);
      this.ts(res, obj.id);
      this.ts(res, val);
    } else {
      res.push(Code.MakeConst);
      this.ts(res, obj.id);
      if (val !== undefined) res.push(val);
    }
    arr.push(res);
  }
}
