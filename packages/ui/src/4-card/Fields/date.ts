import type {ParamDate} from '../StructuralMenu/types';

/** ISO local strings compare lexicographically, so bounds check without parsing. */
export const dateInvalid = (param: ParamDate, value: string): boolean => {
  if (!value) return false; // emptiness is `optional`'s concern, not validation's
  if (param.min && value < param.min) return true;
  if (param.max && value > param.max) return true;
  return false;
};
