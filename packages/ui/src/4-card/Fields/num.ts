import type {ParamNum} from '../StructuralMenu/types';

/** Checks a value against the param's `min`/`max` range. */
export const numInvalid = (param: ParamNum, value: number): boolean => {
  if (!Number.isFinite(value)) return false; // emptiness/garbage is not this check's concern
  if (param.min !== undefined && value < param.min) return true;
  if (param.max !== undefined && value > param.max) return true;
  return false;
};

/** Compact pill label + full tooltip note for the field's range, e.g. "0-40" / "0-40 h". */
export const numHint = (param: ParamNum): {label: string; note: string} | undefined => {
  const {min, max, unit} = param;
  if (min === undefined && max === undefined) return undefined;
  const label =
    min !== undefined && max !== undefined ? `${min}-${max}` : min !== undefined ? `min ${min}` : `max ${max}`;
  return {label, note: unit ? `${label} ${unit}` : label};
};
