import * as React from 'react';
import type {ParamSelect} from '../../../StructuralMenu/types';
import {MultiSelectMenu} from './MultiSelectMenu';
import {SingleSelectMenu} from './SingleSelectMenu';
import {isMultiple} from './utils';

export interface SelectMenuBodyProps {
  param: ParamSelect;
  value: unknown;
  onChange: (value: unknown) => void;
}

/**
 * The options dropdown body for a select field — single or multi, decided by
 * `param.max`. Shared by `ArgSelect` (compact trigger) and `ArgSelectReveal`
 * (value cell). Relies on the ambient popup context for close-on-pick (single).
 */
export const SelectMenuBody: React.FC<SelectMenuBodyProps> = ({param, value, onChange}) => {
  const showSearch = param.showSearch ?? (param.options ?? []).length >= 6;
  return isMultiple(param) ? (
    <MultiSelectMenu param={param} value={value} onChange={onChange} showSearch={showSearch} />
  ) : (
    <SingleSelectMenu param={param} value={value} onChange={onChange} showSearch={showSearch} />
  );
};
