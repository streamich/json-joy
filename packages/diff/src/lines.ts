import {LINE_PATCH_OP_TYPE, type LinePatch} from './line';
import type {DiffLimits} from './limits';
import {PATCH_OP_TYPE} from './str';
import * as tok from './tok';

export type {DiffLimits} from './limits';

/**
 * Token-based line diff: hashes each line to a token and diffs the line
 * sequences with {@link tok.diff}, producing a {@link LinePatch} of whole-line
 * `DEL`/`EQL`/`INS` operations. Unlike `line.diff` it does not detect in-place
 * line modifications (a changed line is a delete plus an insert, never `MIX`),
 * which makes it much faster on large inputs since it never diffs characters.
 * The result is consumable by `line.apply`.
 *
 * @param src Source lines (newline-free is not required; lines are compared whole).
 * @param dst Destination lines.
 * @param limits Optional bounds; without them the patch is minimal. When a
 *     bound is hit the patch is near-minimal instead, and
 *     {@link DiffLimits.hitLimit} is set on the passed object.
 * @returns A line-level patch with no `MIX` operations.
 */
export const diff = (src: string[], dst: string[], limits?: DiffLimits): LinePatch => {
  const runs = tok.diff(src, dst, limits);
  const patch: LinePatch = [];
  let si = 0;
  let di = 0;
  for (const [type, count] of runs) {
    if (type === PATCH_OP_TYPE.EQL)
      for (let k = 0; k < count; k++) {
        patch.push([LINE_PATCH_OP_TYPE.EQL, si, di]);
        si++;
        di++;
      }
    else if (type === PATCH_OP_TYPE.DEL)
      for (let k = 0; k < count; k++) {
        patch.push([LINE_PATCH_OP_TYPE.DEL, si, di - 1]);
        si++;
      }
    else
      for (let k = 0; k < count; k++) {
        patch.push([LINE_PATCH_OP_TYPE.INS, si - 1, di]);
        di++;
      }
  }
  return patch;
};
