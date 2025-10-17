import {type NodeBuilder, s} from '../../../json-crdt-patch';
import type {SliceType, SliceTypeStep} from './types';

export const type = (sliceType: SliceType) =>
  Array.isArray(sliceType) ? s.arr(sliceType.map(step)) : s.con(sliceType);

export const step = (sliceStep: SliceTypeStep) => {
  if (Array.isArray(sliceStep)) {
    const tuple: NodeBuilder[] = [s.con(sliceStep[0])];
    const length = sliceStep.length;
    if (length > 1) tuple.push(s.con(+(sliceStep[1] ?? 0)));
    if (length > 2) tuple.push(s.json(sliceStep[2] ?? {}));
    return s.vec(...tuple);
  }
  return s.con(sliceStep);
};
