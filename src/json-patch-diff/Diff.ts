// import {deepEqual} from '@jsonjoy.com/util/lib/json-equal/deepEqual';
import type {Operation} from '../json-patch/codec/json/types';
import {deepEqual} from '@jsonjoy.com/util/lib/json-equal/deepEqual';
import * as str from '../util/diff/str';
import * as bin from '../util/diff/bin';
import * as arr from '../util/diff/arr';
import {structHash} from '../json-hash';

export class DiffError extends Error {
  constructor(message: string = 'DIFF') {
    super(message);
  }
}

export class Diff {
  protected patch: Operation[] = [];

  protected diffVal(path: string, src: unknown, dst: unknown): void {
    if (deepEqual(src, dst)) return;
    this.patch.push({op: 'add', path, value: dst})
  }

  protected diffStr(path: string, src: string, dst: string): void {
    if (src === dst) return;
    const patch = this.patch;
    str.apply(str.diff(src, dst), src.length,
      (pos, str) => patch.push({op: 'str_ins', path, pos, str}),
      (pos, len, str) => patch.push({op: 'str_del', path, pos, len, str}),
    );
  }

  protected diffBin(path: string, src: Uint8Array, dst: Uint8Array): void {
    throw new Error('Not implemented');
  }

  protected diffObj(path: string, src: Record<string, unknown>, dst: Record<string, unknown>): void {
    const patch = this.patch;
    for (const key in src) {
      if (key in dst) {
        const val1 = src[key];
        const val2 = dst[key];
        if (val1 === val2) continue;
        this.diffAny(path + '/' + key, val1, val2);
      } else {
        patch.push({op: 'remove', path: path + '/' + key});
      }
    }
    for (const key in dst) {
      if (key in src) continue;
      patch.push({op: 'add', path: path + '/' + key, value: dst[key]});
    }
  }

  protected diffArr(path: string, src: unknown[], dst: unknown[]): void {
    throw new Error('Not implemented');
  }

  public diffAny(path: string, src: unknown, dst: unknown): void {
    switch (typeof src) {
      case 'string': {
        if (typeof dst !== 'string') throw new DiffError();
        this.diffStr(path, src, dst);
        break;
      }
      case 'number':
      case 'boolean':
      case 'bigint': {
        this.diffVal(path, src, dst);
        break;
      }
      case 'object': {
        if (!src || !dst || typeof dst !== 'object') return this.diffVal(path, src, dst);
        if (Array.isArray(src) && Array.isArray(dst)) return this.diffArr(path, src, dst);
        this.diffObj(path, src as Record<string, unknown>, dst as Record<string, unknown>);
        break;
      }
      default: throw new DiffError();
    }
    // if (src instanceof ConNode) {
    //   const val = src.val;
    //   if ((val !== dst) && !deepEqual(src.val, dst)) throw new DiffError();
    // } else if (src instanceof StrNode) {
    //   
    // } else if (src instanceof ObjNode) {
    //   if (!dst || typeof dst !== 'object' || Array.isArray(dst)) throw new DiffError();
    //   this.diffObj(src, dst as Record<string, unknown>);
    // } else if (src instanceof ValNode) {
    //   this.diffVal(src, dst);
    // } else if (src instanceof ArrNode) {
    //   if (!Array.isArray(dst)) throw new DiffError();
    //   this.diffArr(src, dst as unknown[]);
    // } else if (src instanceof VecNode) {
    //   if (!Array.isArray(dst)) throw new DiffError();
    //   this.diffVec(src, dst as unknown[]);
    // } else if (src instanceof BinNode) {
    //   if (!(dst instanceof Uint8Array)) throw new DiffError();
    //   this.diffBin(src, dst);
    // } else {
    //   
    // }
  }

  public diff(path: string, src: unknown, dst: unknown): Operation[] {
    this.diffAny(path, src, dst);
    return this.patch;
  }
}
