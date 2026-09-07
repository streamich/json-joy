import * as React from 'react';
import {ItemChip} from '../../../../3-list-item/ChipList';
import type {MenuItem, ParamSelect} from '../../../StructuralMenu/types';

export interface DefaultableSelectValue {
  def: boolean;
  value: string;
}

/** Any value a select field may hold: single id, id list, or defaultable wrapper. */
export type SelectValue = string | string[] | DefaultableSelectValue;

// ---------------------------------------------------------------- Cardinality

/** Capacity of a select param — `1` (single) by default, `> 1` for multi. */
export const selectMax = (param: ParamSelect): number => param.max ?? 1;

/** Whether the select holds several options (value is a `string[]`). */
export const isMultiple = (param: ParamSelect): boolean => selectMax(param) > 1;

/** All option ids of the param, in declared order. */
export const optionIds = (param: ParamSelect): string[] => (param.options ?? []).map((o) => (o.id ?? o.name) as string);

/** Normalize any stored value to a deduped `string[]` in **option order** (drops unknown ids). */
export const readMulti = (value: unknown, param: ParamSelect): string[] => {
  const raw =
    value && typeof value === 'object' && 'def' in (value as object) ? (value as {value: unknown}).value : value;
  const set = new Set<string>(Array.isArray(raw) ? raw.map(String) : typeof raw === 'string' && raw ? [raw] : []);
  return optionIds(param).filter((id) => set.has(id));
};

/** Display label for an option id. */
export const optionLabel = (param: ParamSelect, id: string): React.ReactNode => {
  const o = (param.options ?? []).find((x) => (x.id ?? x.name) === id);
  return o ? (o.display?.() ?? o.name ?? o.id ?? id) : id;
};

// --------------------------------------------------------------- Single value

const readStructured = (v: unknown): DefaultableSelectValue => {
  if (v && typeof v === 'object' && 'def' in v) {
    const s = v as DefaultableSelectValue;
    return {def: !!s.def, value: String(s.value ?? '')};
  }
  return {def: false, value: typeof v === 'string' ? v : ''};
};

/** Single-mode value semantics + actions, shared by the compact and reveal controls. */
export const selectArg = (param: ParamSelect, value: SelectValue, onChange: (value: SelectValue) => void) => {
  const defaultable = !!param.defaultable;
  const s = readStructured(value);
  const def = defaultable && s.def;
  const emit = (next: DefaultableSelectValue) => {
    if (defaultable) onChange?.(next);
    else onChange?.(next.value);
  };
  return {
    defaultable,
    s,
    def,
    setValue: (id: string) => emit({def: false, value: id}),
    enterCustom: () => emit({def: false, value: s.value}),
    revertToAuto: () => emit({def: true, value: s.value}),
  };
};

// ------------------------------------------------------------ Menu decoration

/**
 * Decorate a dropdown option: a colored option renders as a chip (matching the
 * value-cell chips) with its icon tucked inside; plain options stay text rows.
 */
export const optionAsChip = (opt: MenuItem, small = true): MenuItem =>
  opt.color ? {...opt, icon: undefined, display: () => <ItemChip item={opt} small={small} />} : opt;
