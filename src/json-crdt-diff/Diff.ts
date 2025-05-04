import {deepEqual} from '@jsonjoy.com/util/lib/json-equal/deepEqual';
import {ITimespanStruct, type ITimestampStruct, Patch, PatchBuilder, Timespan} from '../json-crdt-patch';
import {ArrNode, BinNode, ConNode, ObjNode, StrNode, ValNode, VecNode, type JsonNode} from '../json-crdt/nodes';
import * as str from '../util/diff/str';
import * as bin from '../util/diff/bin';
import type {Model} from '../json-crdt/model';
import {structHashCrdt} from '../json-hash/structHashCrdt';
import {structHash} from '../json-hash';
import {strCnt} from '../util/strCnt';

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
    str.apply(str.diff(view, dst), view.length,
      (pos, txt) => builder.insStr(src.id, !pos ? src.id : src.find(pos - 1)!, txt),
      (pos, len) => builder.del(src.id, src.findInterval(pos, len)),
    );
  }

  protected diffBin(src: BinNode, dst: Uint8Array): void {
    const view = src.view();
    if (view === dst) return;
    const builder = this.builder;
    bin.apply(bin.diff(view, dst), view.length,
      (pos, txt) => builder.insBin(src.id, !pos ? src.id : src.find(pos - 1)!, txt),
      (pos, len) => builder.del(src.id, src.findInterval(pos, len)),
    );
  }

  protected diffArr(src: ArrNode, dst: unknown[]): void {
    let txtSrc = '';
    let txtDst = '';
    const srcLen = src.length();
    const dstLen = dst.length;
    const inserts: [after: ITimestampStruct, views: unknown[]][] = [];
    const trailingInserts: unknown[] = [];
    const deletes: ITimespanStruct[] = [];
    src.children(node => {
      txtSrc += structHashCrdt(node) + '\n';
    });
    for (let i = 0; i < dstLen; i++) txtDst += structHash(dst[i]) + '\n';
    txtSrc = txtSrc.slice(0, -1);
    txtDst = txtDst.slice(0, -1);
    const patch = str.diff(txtSrc, txtDst);
    console.log(txtSrc);
    console.log(txtDst);
    console.log(patch);
    let srcIdx = 0;
    let dstIdx = 0;
    const patchLen = patch.length;
    const lastOpIndex = patchLen - 1;
    let inTheMiddleOfLine = false;
    for (let i = 0; i <= lastOpIndex; i++) {
      const isLastOp = i === lastOpIndex;
      const op = patch[i];
      const [type, txt] = op;
      if (!txt) continue;
      let lineStartOffset = 0;
      if (inTheMiddleOfLine) {
        const index = txt.indexOf('\n');
        if (index < 0 && !isLastOp) continue;
        inTheMiddleOfLine = false;
        lineStartOffset = index + 1;
        const view = dst[dstIdx];
        if (srcIdx >= srcLen) {
          console.log('PUSH', op, view);
          trailingInserts.push(view);
        } else {
          console.log('DIFF', op, srcIdx, dstIdx, view);
          try {
            this.diffAny(src.getNode(srcIdx)!, view);
          } catch (error) {
            if (error instanceof DiffError) {
              const id = src.find(srcIdx)!;
              const span = new Timespan(id.sid, id.time, 1);
              deletes.push(span);
              const after = srcIdx ? src.find(srcIdx - 1)! : src.id;
              inserts.push([after, [view]]);
            } else throw error;
          }
          srcIdx++;
        }
        if (isLastOp && index < 0) break;
        dstIdx++;
      }
      inTheMiddleOfLine = txt[txt.length - 1] !== '\n';
      const lineCount = strCnt('\n', txt, lineStartOffset) + (isLastOp ? 1 : 0);
      if (!lineCount) continue;
      if (type === str.PATCH_OP_TYPE.EQUAL) {
        console.log('EQUAL', op);
        srcIdx += lineCount;
        dstIdx += lineCount;
      } else if (type === str.PATCH_OP_TYPE.INSERT) {
        const views: unknown[] = dst.slice(dstIdx, dstIdx + lineCount);
        console.log('INSERT', op, views);
        const after = srcIdx ? src.find(srcIdx - 1)! : src.id;
        dstIdx += lineCount;
        inserts.push([after, views]);
      } else { // DELETE
        console.log('DELETE', op);
        for (let i = 0; i < lineCount; i++) {
          const id = src.find(srcIdx)!;
          const span = new Timespan(id.sid, id.time, 1);
          deletes.push(span);
          srcIdx++;
        }
      }
    }
    const builder = this.builder;
    const length = inserts.length;
    for (let i = 0; i < length; i++) {
      const [after, views] = inserts[i];
      builder.insArr(src.id, after, views.map(view => builder.json(view)))
    }
    if (trailingInserts.length) {
      const after = srcLen ? src.find(srcLen - 1)! : src.id;
      builder.insArr(src.id, after, trailingInserts.map(view => builder.json(view)));
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
