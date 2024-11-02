import type {BinaryOp} from './types';
import {append, chunk, componentLength, trim} from './util';

/**
 * Transforms an operation such that the transformed operations can be
 * applied in a reverse order.
 *
 * ```
 * apply(apply(doc, op1), transform(op2, op1)) === apply(apply(doc, op2), transform(op1, op2))
 * ```
 *
 * @param op1 The operation to transform.
 * @param op2 The operation to transform against.
 * @returns A new operation with user intentions preserved.
 */
export const transform = (op1: BinaryOp, op2: BinaryOp, leftInsertFirst: boolean): BinaryOp => {
  const op3: BinaryOp = [];
  const len1 = op1.length;
  const len2 = op2.length;
  let i1 = 0;
  let i2 = 0;
  let off1 = 0;
  for (; i2 < len2; i2++) {
    const comp2 = op2[i2];
    if (typeof comp2 === 'number') {
      if (comp2 > 0) {
        let length2 = comp2;
        while (length2 > 0) {
          const comp1 = op1[i1];
          const comp = i1 >= len1 ? length2 : chunk(comp1, off1, length2);
          const compLength = componentLength(comp);
          const length1 = componentLength(comp1 || comp);
          append(op3, comp);
          off1 += compLength;
          if (off1 >= length1) {
            i1++;
            off1 = 0;
          }
          if (!(comp instanceof Uint8Array)) length2 -= compLength;
        }
      } else {
        const length2 = -comp2;
        let off2 = 0;
        while (off2 < length2) {
          const remaining = length2 - off2;
          const comp1 = op1[i1];
          const comp = i1 >= len1 ? remaining : chunk(comp1, off1, remaining);
          const compLength = componentLength(comp);
          const length1 = componentLength(comp1 || comp);
          if (comp instanceof Uint8Array) append(op3, comp);
          else off2 += compLength;
          off1 += compLength;
          if (off1 >= length1) {
            i1++;
            off1 = 0;
          }
        }
      }
    } else if (comp2 instanceof Uint8Array) {
      if (leftInsertFirst) {
        if (op1[i1] instanceof Uint8Array) {
          const comp = chunk(op1[i1++], off1, Number.POSITIVE_INFINITY);
          off1 = 0;
          append(op3, comp);
        }
      }
      append(op3, comp2.length);
    }
  }
  if (i1 < len1 && off1) append(op3, chunk(op1[i1++], off1, Number.POSITIVE_INFINITY));
  for (; i1 < len1; i1++) append(op3, op1[i1]);
  trim(op3);
  return op3;
};
