import type {StringOp} from './types';
import {append, chunk, componentLength, isDeleteComponent, trim} from './util';

/**
 * Combine two operations into one, such that the changes produced by the
 * by the single operation are the same as if the two operations were applied
 * in sequence.
 *
 * ```
 * apply(str, combine(op1, op2)) === apply(apply(str, op1), op2)
 * ```
 *
 * @param op1 First operation.
 * @param op2 Second operation.
 * @returns A combined operation.
 */
export const compose = (op1: StringOp, op2: StringOp): StringOp => {
  const op3: StringOp = [];
  const len1 = op1.length;
  const len2 = op2.length;
  let off1 = 0;
  let i1 = 0;
  for (let i2 = 0; i2 < len2; i2++) {
    const comp2 = op2[i2];
    switch (typeof comp2) {
      case 'number': {
        if (comp2 > 0) {
          let length2 = comp2;
          while (length2 > 0) {
            const comp1 = op1[i1];
            const comp = i1 >= len1 ? length2 : chunk(comp1, off1, length2);
            const compLength = componentLength(comp);
            const isDelete = isDeleteComponent(comp);
            const length1 = componentLength(comp1 || comp);
            append(op3, comp);
            off1 += compLength;
            if (off1 >= length1) {
              i1++;
              off1 = 0;
            }
            if (!isDelete) length2 -= compLength;
          }
        } else {
          const length2 = -comp2;
          let off2 = 0;
          while (off2 < length2) {
            const remaining = length2 - off2;
            const comp1 = op1[i1];
            const comp = i1 >= len1 ? remaining : chunk(comp1, off1, remaining);
            const compLength = componentLength(comp);
            const isDelete = isDeleteComponent(comp);
            const length1 = componentLength(comp1 || comp);
            if (isDelete) append(op3, comp);
            else if (typeof comp === 'number') append(op3, -compLength);
            off1 += compLength;
            if (off1 >= length1) {
              i1++;
              off1 = 0;
            }
            if (!isDelete) off2 += compLength;
          }
        }
        break;
      }
      case 'string': {
        append(op3, comp2);
        break;
      }
    }
  }
  if (i1 < len1 && off1) append(op3, chunk(op1[i1++], off1, Number.POSITIVE_INFINITY));
  for (; i1 < len1; i1++) append(op3, op1[i1]);
  trim(op3);
  return op3;
};
