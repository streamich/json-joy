import type {Op} from '../json-patch/op';
import {xforms} from './transforms';

/**
 * Takes array of proposed patches and transforms them against an array of
 * already accepted patches.
 *
 * @param accepted Array of already accepted operations.
 * @param proposed Array of proposed operations. Proposed operations are mutated inline.
 * @param acceptedWins Whether accepted operation should win on when paths match exactly.
 *
 * @returns Array of transformed changes
 */
export const transform = (accepted: readonly Op[], proposed: readonly Op[]): readonly Op[] => {
  const length = accepted.length;
  for (let i = 0; i < length; i++) {
    const against = accepted[i];
    const transformFunction = (xforms as any)[against.op()];
    if (transformFunction) {
      const transformed: Op[] = [];
      for (const op of proposed) {
        const newOps = transformFunction(against, op);
        if (Array.isArray(newOps)) transformed.push(...newOps);
        else if (newOps) transformed.push(newOps);
      }
      proposed = transformed;
    }
  }
  return proposed;
};
