import type {CustomStyle} from './types';

/**
 * Filters a stored value into a CustomStyle. Drops keys with the wrong
 * primitive type and keeps the rest as-is (the CSS emitter is forgiving).
 */
export const sanitizeCustomStyle = (v: unknown): CustomStyle | undefined => {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return undefined;
  const src = v as Record<string, unknown>;
  const out: CustomStyle = {};
  const num = (k: keyof CustomStyle) => {
    const x = src[k as string];
    if (typeof x === 'number' && Number.isFinite(x)) (out as any)[k] = x;
  };
  const str = (k: keyof CustomStyle) => {
    const x = src[k as string];
    if (typeof x === 'string' && x.length) (out as any)[k] = x;
  };
  const bool = (k: keyof CustomStyle) => {
    const x = src[k as string];
    if (typeof x === 'boolean') (out as any)[k] = x;
  };
  str('ff');
  num('fz');
  num('fw');
  num('fs');
  bool('os');
  str('lig');
  str('nv');
  num('lh');
  num('ls');
  num('ws');
  str('krn');
  bool('it');
  bool('caps');
  bool('smcp');
  num('uo');
  num('dt');
  str('fg');
  str('bg');
  return Object.keys(out).length ? out : undefined;
};

export const isEmptyCustomStyle = (cs: CustomStyle | undefined): boolean =>
  !cs || Object.keys(cs).length === 0;
