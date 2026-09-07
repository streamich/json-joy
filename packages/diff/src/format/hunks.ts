import {LINE_PATCH_OP_TYPE, type LinePatch} from '../line';
import {Hunk, HUNK_OP_TYPE, HunkLine, type HunkOptions} from './types';

/**
 * A patch operation flattened to one emitted line, carrying its position in
 * *both* files: a `DEL` records the destination line it sits before, an `INS`
 * the source line it sits before. That is what an empty-side range number is.
 */
export type Op = [type: HUNK_OP_TYPE, src: number, dst: number];

export const flatten = (patch: LinePatch): Op[] => {
  const ops: Op[] = [];
  const length = patch.length;
  let si = 0;
  let di = 0;
  let i = 0;
  while (i < length) {
    const type = patch[i][0];
    if (type === LINE_PATCH_OP_TYPE.EQL) {
      ops.push([HUNK_OP_TYPE.EQL, si++, di++]);
      i++;
      continue;
    }
    let dels = 0;
    let inss = 0;
    let j = i;
    for (; j < length; j++) {
      const runType = patch[j][0];
      if (runType === LINE_PATCH_OP_TYPE.EQL) break;
      if (runType !== LINE_PATCH_OP_TYPE.INS) dels++;
      if (runType !== LINE_PATCH_OP_TYPE.DEL) inss++;
    }
    for (let k = 0; k < dels; k++) ops.push([HUNK_OP_TYPE.DEL, si + k, di]);
    for (let k = 0; k < inss; k++) ops.push([HUNK_OP_TYPE.INS, si + dels, di + k]);
    si += dels;
    di += inss;
    i = j;
  }
  return ops;
};

/**
 * The array to hand `lines.diff` for a file that does not end in a newline -
 * for every style **except {@link ed}**, which is the exception below.
 *
 * @param lines Lines of the file, without terminators.
 * @param noEol Whether the file ends without a newline.
 * @returns `lines` itself when the file is newline-terminated or empty.
 */
export const diffKeys = (lines: string[], noEol?: boolean): string[] => {
  const length = lines.length;
  if (!noEol || !length) return lines;
  const keys = lines.slice();
  keys[length - 1] += '\n';
  return keys;
};

/**
 * Groups a line patch into hunks: each change run plus `context` lines around
 * it, two hunks merged when their context regions touch or overlap. The shared
 * core of every style - `unified` and `context` render this, `normal`, `ed` and
 * `rcs` render it at `context: 0`, where nothing merges (change runs are
 * maximal) and the ranges are the raw change ranges.
 *
 * @param src Source lines, without terminators.
 * @param dst Destination lines, without terminators.
 * @param patch A patch between them, from `lines.diff` or `line.diff`.
 * @param opts Context width, no-final-newline flags, section callback.
 * @returns The hunks in file order; empty when nothing changed.
 */
export const hunks = (src: string[], dst: string[], patch: LinePatch, opts?: HunkOptions): Hunk[] => {
  const requested = opts?.context ?? 3;
  // Clamped, not validated: a negative width makes `stop` land at or before the
  // op the hunk started on, and `i = stop` then never advances - the loop spins
  // and allocates until the heap dies. A fractional one indexes `ops` with a
  // fraction and reads `undefined`. See {@link HunkOptions.context}: rejecting a
  // bad width is the caller's boundary, terminating is this function's.
  const context = requested > 0 ? Math.floor(requested) : 0;
  const section = opts?.section;
  const ignorable = opts?.ignorable;
  const ops = flatten(patch);
  const length = ops.length;
  /** Whether every changed line of the run `[from, to)` is ignorable. */
  const trivial = (from: number, to: number): boolean => {
    if (!ignorable) return false;
    for (let k = from; k < to; k++) {
      const op = ops[k];
      if (!ignorable(op[0], op[0] === HUNK_OP_TYPE.INS ? op[2] : op[1])) return false;
    }
    return true;
  };
  const srcLength = src.length;
  const dstLength = dst.length;
  // The line each marker attaches to, or -1 when the file ends in a newline.
  const srcLast = opts?.srcNoEol ? srcLength - 1 : -1;
  const dstLast = opts?.dstNoEol ? dstLength - 1 : -1;
  const out: Hunk[] = [];
  let i = 0;
  while (i < length) {
    if (ops[i][0] === HUNK_OP_TYPE.EQL) {
      i++;
      continue;
    }
    let end = i;
    while (end < length && ops[end][0] !== HUNK_OP_TYPE.EQL) end++;
    let counts = !trivial(i, end);
    // Absorb every following change run whose context region touches this one.
    while (end < length) {
      let gap = end;
      while (gap < length && ops[gap][0] === HUNK_OP_TYPE.EQL) gap++;
      if (gap === length) break;
      let next = gap;
      while (next < length && ops[next][0] !== HUNK_OP_TYPE.EQL) next++;
      const skippable = trivial(gap, next);
      if (gap - end >= (skippable ? context : 2 * context + 1)) break;
      end = next;
      counts ||= !skippable;
    }
    const start = i > context ? i - context : 0;
    const stop = end + context < length ? end + context : length;
    // Nothing in this hunk is a difference under the caller's rule. Skipping to
    // `stop` cannot skip a run: an unabsorbed one starts at or after it.
    if (!counts) {
      i = stop;
      continue;
    }
    const srcStart = ops[start][1];
    const dstStart = ops[start][2];
    const oldCount = (stop < length ? ops[stop][1] : srcLength) - srcStart;
    const newCount = (stop < length ? ops[stop][2] : dstLength) - dstStart;
    const lines: HunkLine[] = [];
    for (let k = start; k < stop; k++) {
      const op = ops[k];
      const type = op[0];
      const s = op[1];
      const d = op[2];
      const noEol = (type !== HUNK_OP_TYPE.INS && s === srcLast) || (type !== HUNK_OP_TYPE.DEL && d === dstLast);
      lines.push(new HunkLine(type, type === HUNK_OP_TYPE.INS ? dst[d] : src[s], noEol));
    }
    out.push(
      new Hunk(
        oldCount ? srcStart + 1 : srcStart,
        oldCount,
        newCount ? dstStart + 1 : dstStart,
        newCount,
        lines,
        section?.(srcStart),
      ),
    );
    i = stop;
  }
  return out;
};
