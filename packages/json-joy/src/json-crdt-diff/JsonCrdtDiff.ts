import {deepEqual} from '@jsonjoy.com/util/lib/json-equal/deepEqual';
import {cmpUint8Array} from '@jsonjoy.com/util/lib/buffers/cmpUint8Array';
import {type ITimespanStruct, type ITimestampStruct, type Patch, PatchBuilder} from '../json-crdt-patch';
import {ArrNode, BinNode, ConNode, ObjNode, StrNode, ValNode, VecNode, type JsonNode} from '../json-crdt/nodes';
import * as str from '../util/diff/str';
import * as bin from '../util/diff/bin';
import * as line from '../util/diff/line';
import {structHashCrdt} from '../json-hash/structHashCrdt';
import {structHash} from '../json-hash';
import type {Model} from '../json-crdt/model';

export class DiffError extends Error {
  constructor(message: string = 'DIFF') {
    super(message);
  }
}

export class JsonCrdtDiff {
  protected builder: PatchBuilder;

  public constructor(protected readonly model: Model<any>) {
    this.builder = new PatchBuilder(model.clock.clone());
  }

  protected diffStr(src: StrNode, dst: string): void {
    const view = src.view();
    if (view === dst) return;
    const builder = this.builder;
    str.apply(
      str.diff(view, dst),
      view.length,
      (pos, txt) => builder.insStr(src.id, !pos ? src.id : src.find(pos - 1)!, txt),
      (pos, len) => builder.del(src.id, src.findInterval(pos, len)),
    );
  }

  protected diffBin(src: BinNode, dst: Uint8Array): void {
    const view = src.view();
    if (cmpUint8Array(view, dst)) return;
    const builder = this.builder;
    bin.apply(
      bin.diff(view, dst),
      view.length,
      (pos, txt) => builder.insBin(src.id, !pos ? src.id : src.find(pos - 1)!, txt),
      (pos, len) => builder.del(src.id, src.findInterval(pos, len)),
    );
  }

  protected diffArr(src: ArrNode, dst: unknown[]): void {
    const srcLines: string[] = [];
    src.children((node) => {
      srcLines.push(structHashCrdt(node));
    });
    const dstLines: string[] = [];
    const dstLength = dst.length;
    for (let i = 0; i < dstLength; i++) dstLines.push(structHash(dst[i]));
    const linePatch = line.diff(srcLines, dstLines);
    if (!linePatch.length) return;
    const inserts: [after: ITimestampStruct, views: unknown[]][] = [];
    const deletes: ITimespanStruct[] = [];
    const patchLength = linePatch.length;
    for (let i = patchLength - 1; i >= 0; i--) {
      const [type, posSrc, posDst] = linePatch[i];
      switch (type) {
        case line.LINE_PATCH_OP_TYPE.EQL:
          break;
        case line.LINE_PATCH_OP_TYPE.INS: {
          const view = dst[posDst];
          const after = posSrc >= 0 ? src.find(posSrc) : src.id;
          if (!after) throw new DiffError();
          inserts.push([after, [view]]);
          break;
        }
        case line.LINE_PATCH_OP_TYPE.DEL: {
          const span = src.findInterval(posSrc, 1);
          if (!span || !span.length) throw new DiffError();
          deletes.push(...span);
          break;
        }
        case line.LINE_PATCH_OP_TYPE.MIX: {
          const view = dst[posDst];
          try {
            this.diffAny(src.getNode(posSrc)!, view);
          } catch (error) {
            if (error instanceof DiffError) {
              const span = src.findInterval(posSrc, 1)!;
              deletes.push(...span);
              const after = posSrc ? src.find(posSrc - 1) : src.id;
              if (!after) throw new DiffError();
              inserts.push([after, [view]]);
            } else throw error;
          }
        }
      }
    }
    const builder = this.builder;
    const length = inserts.length;
    for (let i = 0; i < length; i++) {
      const [after, views] = inserts[i];
      builder.insArr(
        src.id,
        after,
        views.map((view) => builder.json(view)),
      );
    }
    if (deletes.length) builder.del(src.id, deletes);
  }

  protected diffObj(src: ObjNode, dst: Record<string, unknown>): void {
    const builder = this.builder;
    const inserts: [key: string, value: ITimestampStruct][] = [];
    const srcKeys = new Set<string>();
    src.forEach((key) => {
      srcKeys.add(key);
      const dstValue = dst[key];
      if (dstValue === void 0) inserts.push([key, builder.con(undefined)]);
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
      inserts.push([key, src.get(key) instanceof ConNode ? builder.con(dstValue) : builder.constOrJson(dstValue)]);
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
        edits.push([i, builder.con(void 0)]);
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

  protected diffAny(src: JsonNode, dst: unknown): void {
    if (src instanceof ConNode) {
      const val = src.val;
      if (val !== dst && !deepEqual(src.val, dst)) throw new DiffError();
    } else if (src instanceof StrNode) {
      if (typeof dst !== 'string') throw new DiffError();
      this.diffStr(src, dst);
    } else if (src instanceof ObjNode) {
      if (!dst || typeof dst !== 'object' || Array.isArray(dst)) throw new DiffError();
      this.diffObj(src, dst as Record<string, unknown>);
    } else if (src instanceof ValNode) {
      this.diffVal(src, dst);
    } else if (src instanceof ArrNode) {
      if (!Array.isArray(dst)) throw new DiffError();
      this.diffArr(src, dst as unknown[]);
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
