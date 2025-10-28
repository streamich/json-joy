import {compare, type NodeBuilder, s} from '../../../json-crdt-patch';
import {SliceHeaderShift, type SliceStacking} from './constants';
import type {Range} from '../rga/Range';
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

export const slice = (range: Range<any>, stacking: SliceStacking, sliceType: SliceType, data?: unknown) => {
  const {start, end} = range;
  const header =
    (stacking << SliceHeaderShift.Stacking) +
    ((start.anchor & 0b1) << SliceHeaderShift.X1Anchor) +
    ((end.anchor & 0b1) << SliceHeaderShift.X2Anchor);
  const elements = [
    s.con(header),
    s.con(start.id),
    s.con(!compare(start.id, end.id) ? 0 : end.id),
    type(sliceType),
  ] as const;
  if (data !== void 0) (elements as any).push(s.json(data));
  return s.vec(...elements);
};
