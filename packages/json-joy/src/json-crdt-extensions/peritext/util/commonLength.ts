import type {SliceTypeSteps} from '../slice';

export const commonLength = (a: SliceTypeSteps, b: SliceTypeSteps): number => {
  const aLength = a.length;
  const bLength = b.length;
  let i = 0;
  while (i < aLength && i < bLength) {
    const aStep = a[i];
    const bStep = b[i];
    const aTag = Array.isArray(aStep) ? aStep[0] : aStep;
    const bTag = Array.isArray(bStep) ? bStep[0] : bStep;
    if (aTag !== bTag) break;
    const aDiscriminant = Array.isArray(aStep) ? aStep[1] : 0;
    const bDiscriminant = Array.isArray(bStep) ? bStep[1] : 0;
    if (aDiscriminant !== bDiscriminant) break;
    i++;
  }
  return i;
};
