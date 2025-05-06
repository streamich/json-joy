import {deepEqual} from '@jsonjoy.com/util/lib/json-equal/deepEqual';
import * as str from '../util/diff/str';
import * as arr from '../util/diff/arr';
import {structHash} from '../json-hash';
import type {Operation} from '../json-patch/codec/json/types';

export class DiffError extends Error {
  constructor(message: string = 'DIFF') {
    super(message);
  }
}

export class Diff {
  protected patch: Operation[] = [];

  protected diffVal(path: string, src: unknown, dst: unknown): void {
    if (deepEqual(src, dst)) return;
    this.patch.push({op: 'replace', path, value: dst})
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
    const srcLines: string[] = [];
    const dstLines: string[] = [];
    const srcLen = src.length;
    const dstLen = dst.length;
    for (let i = 0; i < srcLen; i++) srcLines.push(structHash(src[i]));
    for (let i = 0; i < dstLen; i++) dstLines.push(structHash(dst[i]));
    const pfx = path + '/';
    let shift = 0;
    const patch = this.patch;
    // let deletes: number = 0;
    arr.apply(arr.diff(srcLines, dstLines),
      (posSrc, posDst, len) => {
        for (let i = 0; i < len; i++)
          patch.push({op: 'add', path: pfx + (posSrc + shift + i), value: dst[posDst + i]});
        shift += len;;
      },
      (pos, len) => {
        for (let i = 0; i < len; i++)
          patch.push({op: 'remove', path: pfx + (pos + shift)});
        shift -= len;
      },
      (posSrc, posDst, len) => {
        for (let i = 0; i < len; i++) {
          const pos = posSrc + shift + i;
          const srcValue = src[posSrc + i];
          const dstValue = dst[posDst + i];
          this.diff(pfx + pos, srcValue, dstValue);
        }
      },
    );
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
        if (Array.isArray(src)) {
          if (Array.isArray(dst)) this.diffArr(path, src, dst);
          else this.diffVal(path, src, dst);
          return;
        }
        this.diffObj(path, src as Record<string, unknown>, dst as Record<string, unknown>);
        break;
      }
      default:
        this.diffVal(path, src, dst);
        break;
    }
  }

  public diff(path: string, src: unknown, dst: unknown): Operation[] {
    this.diffAny(path, src, dst);
    return this.patch;
  }
}
