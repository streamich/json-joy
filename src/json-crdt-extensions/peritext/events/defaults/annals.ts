import {Anchor} from '../../../../json-crdt-extensions/peritext/rga/constants';
import {DelOp, equal, InsArrOp, InsBinOp, InsStrOp, type Patch, Timestamp} from '../../../../json-crdt-patch';
import type {Peritext} from '../../../../json-crdt-extensions';
import type {Range} from '../../../../json-crdt-extensions/peritext/rga/Range';

/**
 * Given an undo/redo patch/batch, calculates a good cursor position to place
 * the cursor after the patch is applied, so that the user can continue typing
 * from the same logical position.
 *
 * @param patch Undo/Redo patch
 * @returns Range
 */
export const placeCursor = (txt: Peritext, batch: Patch[]): Range | undefined => {
  const batchLength = batch.length;
  for (let j = batchLength - 1; j >= 0; j--) {
    const patch = batch[j];
    const ops = patch.ops;
    const length = ops.length;
    for (let i = length - 1; i >= 0; i--) {
      const op = ops[i];
      if (op instanceof InsStrOp || op instanceof InsBinOp || op instanceof InsArrOp) {
        const opId = op.id;
        const lastCharId = new Timestamp(opId.sid, opId.time + op.span() - 1);
        const point = txt.point(lastCharId, Anchor.After);
        const cursor = txt.range(point);
        return cursor;
      } else if (op instanceof DelOp && equal(op.obj, txt.str.id)) {
        const lastSpan = op.what[op.what.length - 1];
        if (lastSpan) {
          const point = txt.point(lastSpan, Anchor.Before);
          point.halfstep(-1);
          const cursor = txt.range(point);
          return cursor;
        }
      }
    }
  }
  return;
};
