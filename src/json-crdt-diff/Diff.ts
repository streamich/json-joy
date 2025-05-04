import {deepEqual} from '@jsonjoy.com/util/lib/json-equal/deepEqual';
import {type ITimestampStruct, Patch, PatchBuilder} from '../json-crdt-patch';
import {ArrNode, BinNode, ConNode, ObjNode, StrNode, ValNode, VecNode, type JsonNode} from '../json-crdt/nodes';
import * as str from '../util/diff/str';
import * as bin from '../util/diff/bin';
import type {Model} from '../json-crdt/model';

export class DiffError extends Error {
  constructor(message: string = 'DIFF') {
    super(message);
  }
}

export class Diff {
  protected builder: PatchBuilder;

  public constructor(protected readonly model: Model<any>) {
    this.builder = new PatchBuilder(model.clock.clone());
  }

  protected diffStr(src: StrNode, dst: string): void {
    const view = src.view();
    if (view === dst) return;
    const builder = this.builder;
    str.apply(str.diff(view, dst), (pos, txt) => {
      const after = !pos ? src.id : src.find(pos - 1);
      if (!after) throw new DiffError();
      builder.insStr(src.id, after, txt);
      pos += txt.length;
    }, (pos, len) => {
      const spans = src.findInterval(pos, len);
      if (!spans) throw new DiffError();
      builder.del(src.id, spans);
    }, true);
  }

  protected diffBin(src: BinNode, dst: Uint8Array): void {
    const view = src.view();
    if (view === dst) return;
    const builder = this.builder;
    bin.apply(bin.diff(view, dst), (pos, txt) => {
      const after = !pos ? src.id : src.find(pos - 1);
      if (!after) throw new DiffError();
      builder.insBin(src.id, after, txt);
      pos += txt.length;
    }, (pos, len) => {
      const spans = src.findInterval(pos, len);
      if (!spans) throw new DiffError();
      builder.del(src.id, spans);
    }, true);
  }

  protected diffObj(src: ObjNode, dst: Record<string, unknown>): void {
    const builder = this.builder;
    const inserts: [key: string, value: ITimestampStruct][] = [];
    const srcKeys = new Set<string>();
    src.forEach((key) => {
      srcKeys.add(key);
      const dstValue = dst[key];
      if (dstValue === void 0) inserts.push([key, builder.const(undefined)]);
    });
    const keys = Object.keys(dst);
    const length = keys.length;
    for (let i = 0; i < length; i++) {
      const key = keys[i];
      const dstValue = dst[key];
      if (srcKeys.has(key)) {
        const child = src.get(key);
        if (child) {
          try {
            this.diffAny(child, dstValue);
            continue;
          } catch (error) {
            if (!(error instanceof DiffError)) throw error;
          }
        }
      }
      inserts.push([key, builder.constOrJson(dstValue)]);
    }
    if (inserts.length) builder.insObj(src.id, inserts);
  }

  protected diffVec(src: VecNode, dst: unknown[]): void {
    const builder = this.builder;
    const edits: [key: number, value: ITimestampStruct][] = [];
    const elements = src.elements;
    const srcLength = elements.length;
    const dstLength = dst.length;
    const index = src.doc.index;
    const min = Math.min(srcLength, dstLength);
    for (let i = dstLength; i < srcLength; i++) {
      const id = elements[i];
      if (id) {
        const child = index.get(id);
        const isDeleted = !child || (child instanceof ConNode && child.val === void 0);
        if (isDeleted) return;
        edits.push([i, builder.const(void 0)]);
      }
    }
    for (let i = 0; i < min; i++) {
      const value = dst[i];
      const child = src.get(i);
      if (child) {
        try {
          this.diffAny(child, value);
          continue;
        } catch (error) {
          if (!(error instanceof DiffError)) throw error;
        }
      }
      edits.push([i, builder.constOrJson(value)]);
    }
    for (let i = srcLength; i < dstLength; i++) edits.push([i, builder.constOrJson(dst[i])]);
    if (edits.length) builder.insVec(src.id, edits);
  }

  protected diffVal(src: ValNode, dst: unknown): void {
    try {
      this.diffAny(src.node(), dst);
    } catch (error) {
      if (error instanceof DiffError) {
        const builder = this.builder;
        builder.setVal(src.id, builder.constOrJson(dst));
      } else throw error;
    }
  }

  public diffAny(src: JsonNode, dst: unknown): void {
    if (src instanceof ConNode) {
      const val = src.val;
      if ((val !== dst) && !deepEqual(src.val, dst)) throw new DiffError();
    } else if (src instanceof StrNode) {
      if (typeof dst !== 'string') throw new DiffError();
      this.diffStr(src, dst);
    } else if (src instanceof ObjNode) {
      if (!dst || typeof dst !== 'object') throw new DiffError();
      this.diffObj(src, dst as Record<string, unknown>);
    } else if (src instanceof ValNode) {
      this.diffVal(src, dst);
    } else if (src instanceof ArrNode) {
      throw new Error('not implemented');
    } else if (src instanceof VecNode) {
      if (!Array.isArray(dst)) throw new DiffError();
      this.diffVec(src, dst as unknown[]);
    } else if (src instanceof BinNode) {
      if (!(dst instanceof Uint8Array)) throw new DiffError();
      this.diffBin(src, dst);
    } else {
      throw new DiffError();
    }
  }

  public diff(src: JsonNode, dst: unknown): Patch {
    this.diffAny(src, dst);
    return this.builder.flush();
  }
}
