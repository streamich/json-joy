import type {ParamStr} from '../StructuralMenu/types';

/** Checks a value against the param's `min`/`max` length and `validate` rule. */
export const strInvalid = (param: ParamStr, value: string): boolean => {
  if (!value) return false; // emptiness is `optional`'s concern, not validation's
  if (param.min !== undefined && value.length < param.min) return true;
  if (param.max !== undefined && value.length > param.max) return true;
  const check = param.validate;
  if (check instanceof RegExp) return !check.test(value);
  if (typeof check === 'function') return !check(value);
  return false;
};

/** One-line description of the field's restrictions, e.g. "URL, 8-120 chars". */
export const strRules = (param: ParamStr): string => {
  const parts: string[] = [];
  if (param.format) parts.push(param.format);
  const {min, max} = param;
  if (min !== undefined && max !== undefined) parts.push(`${min}-${max} chars`);
  else if (min !== undefined) parts.push(`min ${min} chars`);
  else if (max !== undefined) parts.push(`max ${max} chars`);
  return parts.join(', ');
};

/** Compact pill label + full tooltip note for the field's restrictions. */
export const strHint = (param: ParamStr): {label: string; note: string} | undefined => {
  const note = strRules(param);
  if (!note) return undefined;
  const {min, max} = param;
  const label =
    param.format ??
    (min !== undefined && max !== undefined ? `${min}-${max}` : min !== undefined ? `min ${min}` : `max ${max}`);
  return {label, note};
};
