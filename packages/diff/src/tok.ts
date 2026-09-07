import {bestSplit, deadlineLimits, type DiffLimits} from './limits';
import {PATCH_OP_TYPE} from './str';

export type {DiffLimits} from './limits';

export type TokenPatchOp = [type: PATCH_OP_TYPE, count: number];

/**
 * A token-level patch: a run-length list of operations over a token sequence.
 * Each op covers `count` tokens; positions are recovered by accumulation.
 */
export type TokenPatch = TokenPatchOp[];

const equal = (a: Int32Array, b: Int32Array): boolean => {
  const length = a.length;
  if (length !== b.length) return false;
  for (let i = 0; i < length; i++) if (a[i] !== b[i]) return false;
  return true;
};

const commonPrefix = (a: Int32Array, b: Int32Array): number => {
  const n = Math.min(a.length, b.length);
  let i = 0;
  while (i < n && a[i] === b[i]) i++;
  return i;
};

const commonSuffix = (a: Int32Array, b: Int32Array): number => {
  const al = a.length;
  const bl = b.length;
  const n = Math.min(al, bl);
  let i = 0;
  while (i < n && a[al - 1 - i] === b[bl - 1 - i]) i++;
  return i;
};

const indexOf = (haystack: Int32Array, needle: Int32Array): number => {
  const hl = haystack.length;
  const nl = needle.length;
  outer: for (let i = 0; i <= hl - nl; i++) {
    for (let j = 0; j < nl; j++) if (haystack[i + j] !== needle[j]) continue outer;
    return i;
  }
  return -1;
};

const bisectSplit = (a: Int32Array, b: Int32Array, x: number, y: number, limits?: DiffLimits): TokenPatch =>
  diffRange(a.subarray(0, x), b.subarray(0, y), limits).concat(diffRange(a.subarray(x), b.subarray(y), limits));

// A bound was hit: split at the best diagonal reached instead of searching on.
// `sub` is what the two halves are diffed under, which is the caller's own
// limits except when an expired clock hands them a cost bound instead.
const degrade = (
  a: Int32Array,
  b: Int32Array,
  v1: Int32Array,
  v2: Int32Array,
  vOffset: number,
  limits?: DiffLimits,
  sub: DiffLimits | undefined = limits,
): TokenPatch => {
  if (limits) limits.hitLimit = true;
  const aLen = a.length;
  const bLen = b.length;
  const [x, y] = bestSplit(v1, v2, vOffset, aLen, bLen);
  // No diagonal moved, so a split would recurse on the same range forever.
  if ((!x && !y) || (x === aLen && y === bLen))
    return [
      [PATCH_OP_TYPE.DEL, aLen],
      [PATCH_OP_TYPE.INS, bLen],
    ];
  return bisectSplit(a, b, x, y, sub);
};

const bisect = (a: Int32Array, b: Int32Array, limits?: DiffLimits): TokenPatch => {
  const aLen = a.length;
  const bLen = b.length;
  const maxD = Math.ceil((aLen + bLen) / 2);
  const vOffset = maxD;
  const vLength = 2 * maxD;
  const v1 = new Int32Array(vLength).fill(-1);
  const v2 = new Int32Array(vLength).fill(-1);
  v1[vOffset + 1] = 0;
  v2[vOffset + 1] = 0;
  const delta = aLen - bLen;
  const front = delta % 2 !== 0;
  let k1start = 0;
  let k1end = 0;
  let k2start = 0;
  let k2end = 0;
  const maxCost = limits?.maxCost;
  const deadline = limits?.deadline;
  // NaN and negative budgets collapse to zero: a bad budget must still bound.
  const bound = maxCost === undefined || maxCost >= maxD ? maxD : maxCost > 0 ? maxCost : 0;
  for (let d = 0; d < bound; d++) {
    // The ranges below inherit a cost bound rather than the dead clock.
    if (deadline !== undefined && !deadline.isValid())
      return degrade(a, b, v1, v2, vOffset, limits, deadlineLimits(aLen, bLen));
    for (let k1 = -d + k1start; k1 <= d - k1end; k1 += 2) {
      const k1Offset = vOffset + k1;
      let x1: number;
      const v10 = v1[k1Offset - 1];
      const v11 = v1[k1Offset + 1];
      if (k1 === -d || (k1 !== d && v10 < v11)) x1 = v11;
      else x1 = v10 + 1;
      let y1 = x1 - k1;
      while (x1 < aLen && y1 < bLen && a[x1] === b[y1]) {
        x1++;
        y1++;
      }
      v1[k1Offset] = x1;
      if (x1 > aLen) k1end += 2;
      else if (y1 > bLen) k1start += 2;
      else if (front) {
        const k2Offset = vOffset + delta - k1;
        if (k2Offset >= 0 && k2Offset < vLength && v2[k2Offset] !== -1) {
          if (x1 >= aLen - v2[k2Offset]) return bisectSplit(a, b, x1, y1, limits);
        }
      }
    }
    for (let k2 = -d + k2start; k2 <= d - k2end; k2 += 2) {
      const k2Offset = vOffset + k2;
      let x2: number;
      const v20 = v2[k2Offset - 1];
      const v21 = v2[k2Offset + 1];
      if (k2 === -d || (k2 !== d && v20 < v21)) x2 = v21;
      else x2 = v20 + 1;
      let y2 = x2 - k2;
      while (x2 < aLen && y2 < bLen && a[aLen - x2 - 1] === b[bLen - y2 - 1]) {
        x2++;
        y2++;
      }
      v2[k2Offset] = x2;
      if (x2 > aLen) k2end += 2;
      else if (y2 > bLen) k2start += 2;
      else if (!front) {
        const k1Offset = vOffset + delta - k2;
        if (k1Offset >= 0 && k1Offset < vLength && v1[k1Offset] !== -1) {
          const x1 = v1[k1Offset];
          const y1 = vOffset + x1 - k1Offset;
          if (x1 >= aLen - x2) return bisectSplit(a, b, x1, y1, limits);
        }
      }
    }
  }
  if (bound < maxD) return degrade(a, b, v1, v2, vOffset, limits);
  return [
    [PATCH_OP_TYPE.DEL, aLen],
    [PATCH_OP_TYPE.INS, bLen],
  ];
};

// Called only after common prefix/suffix trimming, so a containment can never
// sit flush against either end: `index` and the trailing `rest` are both > 0.
const diffNoCommonAffix = (a: Int32Array, b: Int32Array, limits?: DiffLimits): TokenPatch => {
  const aLen = a.length;
  const bLen = b.length;
  if (!aLen) return [[PATCH_OP_TYPE.INS, bLen]];
  if (!bLen) return [[PATCH_OP_TYPE.DEL, aLen]];
  const long = aLen > bLen ? a : b;
  const short = aLen > bLen ? b : a;
  const index = indexOf(long, short);
  if (index >= 0) {
    const type = aLen > bLen ? PATCH_OP_TYPE.DEL : PATCH_OP_TYPE.INS;
    return [
      [type, index],
      [PATCH_OP_TYPE.EQL, short.length],
      [type, long.length - index - short.length],
    ];
  }
  if (short.length === 1)
    return [
      [PATCH_OP_TYPE.DEL, aLen],
      [PATCH_OP_TYPE.INS, bLen],
    ];
  return bisect(a, b, limits);
};

const diffRange = (a: Int32Array, b: Int32Array, limits?: DiffLimits): TokenPatch => {
  if (equal(a, b)) return a.length ? [[PATCH_OP_TYPE.EQL, a.length]] : [];
  const prefix = commonPrefix(a, b);
  const aMid = a.subarray(prefix);
  const bMid = b.subarray(prefix);
  const suffix = commonSuffix(aMid, bMid);
  const patch = diffNoCommonAffix(
    aMid.subarray(0, aMid.length - suffix),
    bMid.subarray(0, bMid.length - suffix),
    limits,
  );
  if (prefix) patch.unshift([PATCH_OP_TYPE.EQL, prefix]);
  if (suffix) patch.push([PATCH_OP_TYPE.EQL, suffix]);
  return patch;
};

// Canonicalizes each edit run to DEL before INS. An exact run never produces
// adjacent equality runs (a middle snake attaches to one side of its split,
// and outer affix trimming keeps each half's boundary token distinct), but a
// degraded split can land inside a run of equal tokens, so they are merged.
const canonicalize = (patch: TokenPatch): TokenPatch => {
  const result: TokenPatch = [];
  let del = 0;
  let ins = 0;
  const flush = () => {
    if (del) result.push([PATCH_OP_TYPE.DEL, del]);
    if (ins) result.push([PATCH_OP_TYPE.INS, ins]);
    del = 0;
    ins = 0;
  };
  for (const [type, count] of patch) {
    if (type === PATCH_OP_TYPE.DEL) del += count;
    else if (type === PATCH_OP_TYPE.INS) ins += count;
    else {
      flush();
      const last = result.length ? result[result.length - 1] : undefined;
      if (last && last[0] === PATCH_OP_TYPE.EQL) last[1] += count;
      else result.push([PATCH_OP_TYPE.EQL, count]);
    }
  }
  flush();
  return result;
};

/**
 * Diffs two token sequences. Tokens are interned to integers (equality by
 * `===` for primitives, by identity for objects) and diffed with Myers'
 * algorithm. Returns a run-length {@link TokenPatch}; the caller maps runs back
 * to its own domain.
 *
 * @param src Source tokens.
 * @param dst Destination tokens.
 * @param limits Optional bounds; without them the patch is minimal. When a
 *     bound is hit the patch is near-minimal instead, and
 *     {@link DiffLimits.hitLimit} is set on the passed object.
 * @returns A token-level patch.
 */
export const diff = <T>(src: T[], dst: T[], limits?: DiffLimits): TokenPatch => {
  const ids = new Map<T, number>();
  const intern = (tokens: T[]): Int32Array => {
    const length = tokens.length;
    const out = new Int32Array(length);
    for (let i = 0; i < length; i++) {
      const token = tokens[i];
      let id = ids.get(token);
      if (id === undefined) {
        id = ids.size;
        ids.set(token, id);
      }
      out[i] = id;
    }
    return out;
  };
  return canonicalize(diffRange(intern(src), intern(dst), limits));
};
