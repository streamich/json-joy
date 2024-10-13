/**
 * @description Operations for combining patches together, combining operations
 *     together, and cleaning up operations.
 */

import {equal, Timestamp} from './clock';
import {InsStrOp, NopOp} from './operations';
import type {JsonCrdtPatchOperation, Patch} from './Patch';

/**
 * Combines two or more patches together. The first patch is modified in place.
 * Operations from the second patch are appended to the first patch as is
 * (without cloning).
 *
 * The patches must have the same `sid`. The first patch must have lower logical
 * time than the second patch, and the logical times must not overlap.
 *
 * @param patches The patches to combine.
 */
export const combine = (patches: Patch[]): void => {
  const firstPatch = patches[0];
  const firstPatchId = firstPatch.getId();
  const patchesLength = patches.length;
  for (let i = 1; i < patchesLength; i++) {
    const currentPatch = patches[i];
    const currentPatchId = currentPatch.getId();
    if (!firstPatchId) {
      if (!currentPatchId) return;
      firstPatch.ops = firstPatch.ops.concat(currentPatch.ops);
      return;
    }
    if (!currentPatchId) return;
    if (!firstPatchId || !currentPatchId) throw new Error('EMPTY_PATCH');
    const sidA = firstPatchId.sid;
    if (sidA !== currentPatchId.sid) throw new Error('SID_MISMATCH');
    const timeA = firstPatchId.time;
    const nextTick = timeA + firstPatch.span();
    const timeB = currentPatchId.time;
    const timeDiff = timeB - nextTick;
    if (timeDiff < 0) throw new Error('TIMESTAMP_CONFLICT');
    const needsNoop = timeDiff > 0;
    if (needsNoop) firstPatch.ops.push(new NopOp(new Timestamp(sidA, nextTick), timeDiff));
    firstPatch.ops = firstPatch.ops.concat(currentPatch.ops);
  }
};

/**
 * Compacts operations within a patch. Combines consecutive string inserts.
 * Mutates the operations in place. (Use `patch.clone()` to avoid mutating the
 * original patch.)
 *
 * @param patch The patch to compact.
 */
export const compact = (patch: Patch): void => {
  const ops = patch.ops;
  const length = ops.length;
  let lastOp: JsonCrdtPatchOperation = ops[0];
  const newOps: JsonCrdtPatchOperation[] = [lastOp];
  for (let i = 1; i < length; i++) {
    const op = ops[i];
    if (lastOp instanceof InsStrOp && op instanceof InsStrOp) {
      const lastOpNextTick = lastOp.id.time + lastOp.span();
      const isTimeConsecutive = lastOpNextTick === op.id.time;
      const isInsertIntoSameString = equal(lastOp.obj, op.obj);
      const opRef = op.ref;
      const isAppend = lastOpNextTick === opRef.time + 1 && lastOp.ref.sid === opRef.sid;
      if (isTimeConsecutive && isInsertIntoSameString && isAppend) {
        lastOp.data = lastOp.data + op.data;
        continue;
      }
    }
    newOps.push(op);
    lastOp = op;
  }
  patch.ops = newOps;
};
