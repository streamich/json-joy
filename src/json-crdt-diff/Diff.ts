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
    const patch = diff(view, dst);
    const builder = this.builder;
    const length = patch.length;
    let pos = 0;
    for (let i = 0; i < length; i++) {
      const op = patch[i];
      switch (op[0]) {
        case PATCH_OP_TYPE.EQUAL:
          pos += op[1].length;
          break;
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
      if (dst[key] === void 0) inserts.push([key, builder.const(undefined)]);
    });
    const keys = Object.keys(dst);
    const length = keys.length;
    for (let i = 0; i < length; i++) {
      const key = keys[i];
      if (!srcKeys[key]) {
        const value = dst[key];
        inserts.push([key, builder.const(value)]);
      }
    }
    if (inserts.length) builder.insObj(src.id, inserts);
  }

  public diff(src: JsonNode, dst: unknown): Patch {
    if (src instanceof StrNode) {
      if (typeof dst !== 'string') throw new DiffError();
      this.diffStr(src, dst);
    } else if (src instanceof ObjNode) {
      if (!dst || typeof dst !== 'object') throw new DiffError();
      this.diffObj(src, dst as Record<string, unknown>);
    } else if (src instanceof ArrNode) {
    } else if (src instanceof VecNode) {
    } else if (src instanceof ValNode) {
    } else throw new DiffError();
    return this.builder.flush();
  }
}
