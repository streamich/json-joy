import {deepEqual} from '@jsonjoy.com/util/lib/json-equal/deepEqual';
import {cmpUint8Array} from '@jsonjoy.com/buffers/lib/cmpUint8Array';
import {
  type ITimespanStruct,
  type ITimestampStruct,
  NodeBuilder,
  nodes,
  type Patch,
  PatchBuilder,
  Timestamp,
  tss,
} from '../json-crdt-patch';
import {ArrNode, BinNode, ConNode, ObjNode, StrNode, ValNode, VecNode, type JsonNode} from '../json-crdt/nodes';
import * as str from '../util/diff/str';
import * as bin from '../util/diff/bin';
import * as line from '../util/diff/line';
import {structHashCrdt} from '../json-hash/structHashCrdt';
import {structHashSchema} from '../json-hash/structHashSchema';
import type {Model} from '../json-crdt/model';

export class DiffError extends Error {
  constructor(message: string = 'DIFF') {
    super(message);
  }
}

export class JsonCrdtDiff {
  public builder: PatchBuilder;

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
    if (src.size() === 0) {
      const length = dst.length;
      if (length === 0) return;
      let after: ITimestampStruct = src.id;
      for (let i = 0; i < length; i++) after = this.builder.insArr(src.id, after, [this.buildView(dst[i])]);
      return;
    } else if (dst.length === 0) {
      const spans: ITimespanStruct[] = [];
      for (const chunk of src.chunks()) {
        if (chunk.del) continue;
        const id = chunk.id;
        spans.push(tss(id.sid, id.time, chunk.span));
      }
      if (spans.length) this.builder.del(src.id, spans);
      return;
    }
    const srcLines: string[] = [];
    src.children((node) => srcLines.push(structHashCrdt(node)));
    const dstLines: string[] = [];
    const dstLength = dst.length;
    for (let i = 0; i < dstLength; i++) dstLines.push(structHashSchema(dst[i]));
    const linePatch = line.diff(srcLines, dstLines);
    if (!linePatch.length) return;
    const inserts: [after: ITimestampStruct, views: unknown[]][] = [];
    const deletes: ITimespanStruct[] = [];
    line.apply(
      linePatch,
      (posSrc) => {
        const span = src.findInterval(posSrc, 1);
        if (!span || !span.length) throw new DiffError();
        deletes.push(...span);
      },
      (posSrc, posDst) => {
        const view = dst[posDst];
        const after = posSrc >= 0 ? src.find(posSrc) : src.id;
        if (!after) throw new DiffError();
        inserts.push([after, [view]]);
      },
      (posSrc, posDst) => {
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
      },
    );
    const builder = this.builder;
    const length = inserts.length;
    for (let i = 0; i < length; i++) {
      const [after, views] = inserts[i];
      builder.insArr(
        src.id,
        after,
        views.map((view) => this.buildView(view)),
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
      inserts.push([key, this.buildConView(dstValue)]);
      // inserts.push([key, src.get(key) instanceof ConNode ? builder.con(dstValue) : this.buildConView(dstValue)]);
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
        if (isDeleted) continue;
        edits.push([i, builder.con(void 0)]);
      }
    }
    CHILDREN: for (let i = 0; i < min; i++) {
      const value = dst[i];
      const child = src.get(i);
      if (child) {
        try {
          this.diffAny(child, value);
          continue;
        } catch (error) {
          if (!(error instanceof DiffError)) throw error;
        }
        if (child instanceof ConNode && typeof value !== 'object') {
          const valueId = builder.con(value);
          edits.push([i, valueId]);
          continue CHILDREN;
        }
      }
      edits.push([i, this.buildConView(value)]);
    }
    for (let i = srcLength; i < dstLength; i++) edits.push([i, this.buildConView(dst[i])]);
    if (edits.length) builder.insVec(src.id, edits);
  }

  protected diffVal(src: ValNode, dst: unknown): void {
    try {
      this.diffAny(src.node(), dst);
    } catch (error) {
      if (error instanceof DiffError) {
        const builder = this.builder;
        builder.setVal(src.id, this.buildConView(dst));
      } else throw error;
    }
  }

  protected diffAny(src: JsonNode, dst: unknown): void {
    if (src instanceof ConNode) {
      if (dst instanceof nodes.con) dst = dst.raw;
      const val = src.val;
      if (
        val !== dst &&
        ((val instanceof Timestamp && !(dst instanceof Timestamp)) ||
          (!(val instanceof Timestamp) && dst instanceof Timestamp) ||
          !deepEqual(src.val, dst))
      )
        throw new DiffError();
    } else if (src instanceof StrNode) {
      if (dst instanceof nodes.str) dst = dst.raw;
      if (typeof dst !== 'string') throw new DiffError();
      this.diffStr(src, dst);
    } else if (src instanceof ObjNode) {
      if (dst instanceof nodes.obj) dst = dst.opt ? {...dst.obj, ...dst.opt} : dst.obj;
      if (dst instanceof NodeBuilder) throw new DiffError();
      if (!dst || typeof dst !== 'object' || Array.isArray(dst)) throw new DiffError();
      this.diffObj(src, dst as Record<string, unknown>);
    } else if (src instanceof ValNode) {
      if (dst instanceof nodes.val) dst = dst.value;
      this.diffVal(src, dst);
    } else if (src instanceof ArrNode) {
      if (dst instanceof nodes.arr) dst = dst.arr;
      if (!Array.isArray(dst)) throw new DiffError();
      this.diffArr(src, dst as unknown[]);
    } else if (src instanceof VecNode) {
      if (dst instanceof nodes.vec) dst = dst.value;
      if (!Array.isArray(dst)) throw new DiffError();
      this.diffVec(src, dst as unknown[]);
    } else if (src instanceof BinNode) {
      if (dst instanceof nodes.bin) dst = dst.raw;
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

  protected buildView(dst: unknown): ITimestampStruct {
    const builder = this.builder;
    if (dst instanceof Timestamp) return builder.con(dst);
    if (dst instanceof nodes.con) return builder.con(dst.raw);
    return builder.json(dst);
  }

  protected buildConView(dst: unknown): ITimestampStruct {
    const builder = this.builder;
    if (dst instanceof Timestamp) return builder.con(dst);
    if (dst instanceof nodes.con) return builder.con(dst.raw);
    return builder.constOrJson(dst);
  }
}
