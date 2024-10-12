/**
 * @description Operations for combining patches together, combining operations
 *     together, and cleaning up operations.
 */

import {Timestamp} from "./clock";
import {NopOp} from "./operations";
import type {Patch} from "./Patch";

/**
 * Combines two patches together. The first patch is modified in place.
 * Operations from the second patch are appended to the first patch as is
 * (without cloning).
 * 
 * The patches must have the same `sid`. The first patch must have lower logical
 * time than the second patch, and the logical times must not overlap.
 *
 * @param a First patch to combine.
 * @param b Second patch to combine.
 */
export const combine = (a: Patch, b: Patch): void => {
  const idA = a.getId();
  const idB = b.getId();
  if (!idA) {
    if (!idB) return;
    a.ops = a.ops.concat(b.ops);
    return;
  }
  if (!idB) return;
  if (!idA || !idB) throw new Error('EMPTY_PATCH');
  const sidA = idA.sid;
  if (sidA !== idB.sid) throw new Error('SID_MISMATCH');
  const timeA = idA.time;
  const nextTick = timeA + a.span();
  const timeB = idB.time;
  const timeDiff = timeB - nextTick;
  if (timeDiff < 0) throw new Error('TIMESTAMP_CONFLICT');
  const needsNoop = timeDiff > 0;
  if (needsNoop) a.ops.push(new NopOp(new Timestamp(sidA, nextTick), timeDiff));
  a.ops = a.ops.concat(b.ops);
};
