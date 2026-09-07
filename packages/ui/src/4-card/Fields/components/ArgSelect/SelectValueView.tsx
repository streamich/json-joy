import * as React from 'react';
import {ChipList} from '../../../../3-list-item/ChipList';
import {useSpacingTrace} from '../../../../context/traces';
import type {MenuItem, ParamSelect} from '../../../StructuralMenu/types';
import {EmptyValue} from '../../EmptyValue';
import {FieldHint} from '../FieldHint';
import {readMulti} from './utils';

const MAX_CHIPS = 5;

/**
 * Resting display of a multi-select value: the chosen options as chips (or the
 * "Empty" placeholder), plus a validity marker (warning icon + tooltip) when the
 * selection is below the field's `min`. Chips grow slightly in roomier
 * (`block`) rows and stay small in tight (`card`) rows.
 */
export const SelectMultiValue: React.FC<{param: ParamSelect; value: unknown}> = ({param, value}) => {
  const small = useSpacingTrace(0.5) < 0.6;
  const values = readMulti(value, param);
  const options = param.options ?? [];
  const items = values.map((id) => options.find((o) => (o.id ?? o.name) === id)).filter((o): o is MenuItem => !!o);
  const min = param.min ?? 0;
  const marker = values.length < min ? <FieldHint warn label={`min ${min}`} note={`Select at least ${min}`} /> : null;
  return (
    <span style={{display: 'inline-flex', alignItems: 'center', gap: 6, minWidth: 0}}>
      {items.length ? <ChipList items={items} small={small} max={MAX_CHIPS} /> : <EmptyValue />}
      {marker}
    </span>
  );
};
