import type {LinePatch} from '../line';
import {flatten} from './hunks';
import {Group, GROUP_TYPE, HUNK_OP_TYPE, type ScriptOptions} from './types';

/**
 * @param patch A patch between the two files, from `lines.diff` or `line.diff`.
 * @param opts Options for ignoring certain lines, e.g. whitespace-only changes.
 * @returns The groups in file order. One `UNCHANGED` group for two identical
 *     files, and nothing at all for two empty ones.
 */
export const groups = (patch: LinePatch, opts?: ScriptOptions): Group[] => {
  const ignorable = opts?.ignorable;
  const ops = flatten(patch);
  const length = ops.length;
  const trivial = (from: number, to: number): boolean => {
    if (!ignorable) return false;
    for (let k = from; k < to; k++) {
      const op = ops[k];
      if (!ignorable(op[0], op[0] === HUNK_OP_TYPE.INS ? op[2] : op[1])) return false;
    }
    return true;
  };
  const out: Group[] = [];
  let srcFrom = 0;
  let dstFrom = 0;
  let srcAt = 0;
  let dstAt = 0;
  let i = 0;
  while (i < length) {
    const op = ops[i];
    if (op[0] === HUNK_OP_TYPE.EQL) {
      srcAt = op[1] + 1;
      dstAt = op[2] + 1;
      i++;
      continue;
    }
    let end = i;
    let dels = 0;
    let inss = 0;
    for (; end < length && ops[end][0] !== HUNK_OP_TYPE.EQL; end++)
      if (ops[end][0] === HUNK_OP_TYPE.DEL) dels++;
      else inss++;
    if (trivial(i, end)) {
      srcAt += dels;
      dstAt += inss;
      i = end;
      continue;
    }
    if (srcFrom < srcAt || dstFrom < dstAt) out.push(new Group(GROUP_TYPE.UNCHANGED, srcFrom, srcAt, dstFrom, dstAt));
    const type = (dels ? GROUP_TYPE.OLD : 0) | (inss ? GROUP_TYPE.NEW : 0);
    out.push(new Group(type, srcAt, srcAt + dels, dstAt, dstAt + inss));
    srcFrom = srcAt += dels;
    dstFrom = dstAt += inss;
    i = end;
  }
  if (srcFrom < srcAt || dstFrom < dstAt) out.push(new Group(GROUP_TYPE.UNCHANGED, srcFrom, srcAt, dstFrom, dstAt));
  return out;
};
