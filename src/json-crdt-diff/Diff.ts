import {type ITimestampStruct, Patch, PatchBuilder} from '../json-crdt-patch';
import {ArrNode, ObjNode, StrNode, ValNode, VecNode, type JsonNode} from '../json-crdt/nodes';
import {diff, PATCH_OP_TYPE} from '../util/diff';
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
    // apply(diff(view, dst), (pos, txt) => {
    //   const after = !pos ? src.id : src.find(pos - 1);
    //   if (!after) throw new DiffError();
    //   builder.insStr(src.id, after, txt);
    //   pos += txt.length;
    // }, (pos, len) => {
    //   const spans = src.findInterval(pos, len);
    //   if (!spans) throw new DiffError();
    //   builder.del(src.id, spans);
    // });
    const patch = diff(view, dst);
    const length = patch.length;
    let pos = 0;
    for (let i = 0; i < length; i++) {
      const op = patch[i];
      switch (op[0]) {
        case PATCH_OP_TYPE.EQUAL: {
          pos += op[1].length;
          break;
        }
        case PATCH_OP_TYPE.INSERT: {
          const txt = op[1];
          const after = !pos ? src.id : src.find(pos - 1);
          if (!after) throw new DiffError();
          builder.insStr(src.id, after, txt);
          pos += txt.length;
          break;
        }
        case PATCH_OP_TYPE.DELETE: {
          const length = op[1].length;
          const spans = src.findInterval(pos, length);
          if (!spans) throw new DiffError();
          builder.del(src.id, spans);
          break;
        }
      }
    }
  }

  protected diffObj(src: ObjNode, dst: Record<string, unknown>): void {
    const builder = this.builder;
    const inserts: [key: string, value: ITimestampStruct][] = [];
    const srcKeys: Record<string, 1> = {};
    src.forEach((key) => {
      srcKeys[key] = 1;
      const dstValue = dst[key];
      if (dstValue === void 0) inserts.push([key, builder.const(undefined)]);
    });
    const keys = Object.keys(dst);
    const length = keys.length;
    for (let i = 0; i < length; i++) {
      const key = keys[i];
      const dstValue = dst[key];
      overwrite: {
        if (srcKeys[key]) {
          const node = src.get(key);
          if (node) {
            try {
              this.diffAny(node, dstValue);
              break overwrite;
            } catch (error) {
              if (!(error instanceof DiffError)) throw error;
            }
          }
        }
        inserts.push([key, builder.json(dstValue)]);
      }
    }
    if (inserts.length) builder.insObj(src.id, inserts);
  }

  public diffAny(src: JsonNode, dst: unknown): void {
    if (src instanceof StrNode) {
      if (typeof dst !== 'string') throw new DiffError();
      this.diffStr(src, dst);
    } else if (src instanceof ObjNode) {
      if (!dst || typeof dst !== 'object') throw new DiffError();
      this.diffObj(src, dst as Record<string, unknown>);
    } else if (src instanceof ArrNode) {
    } else if (src instanceof VecNode) {
    } else if (src instanceof ValNode) {
    } else {
      throw new DiffError();
    }
  }

  public diff(src: JsonNode, dst: unknown): Patch {
    this.diffAny(src, dst);
    return this.builder.flush();
  }
}
