import * as React from 'react';
import {Check} from '../../../../1-inline/Check';
import type {SyncStore} from '../../../../types';
import {comp, type ReactValue, val} from '../../../../utils/rsync';
import {ContextMenu} from '../../../ContextMenu/ContextMenu';
import type {MenuItem, ParamSelect} from '../../../StructuralMenu/types';
import {optionAsChip, optionIds, readMulti, selectMax} from './utils';

/** Reactive selection checkbox in a multi-select menu row. */
const SelectCheck: React.FC<{sel: ReactValue<string[]>; id: string}> = ({sel, id}) => {
  const values = sel.use();
  return (
    <span style={{display: 'inline-flex', pointerEvents: 'none'}}>
      <Check size={18} checked={values.includes(id)} />
    </span>
  );
};

/**
 * Build the multi-select options menu against a reactive selection store. Rows
 * toggle (`keepOpen`), show a live checkbox, and disable while unselected once
 * capacity (`max`) is reached. The menu object is stable so the surrounding
 * `ContextMenu` keeps its state (search) across toggles.
 */
const buildMultiSelectMenu = (
  param: ParamSelect,
  sel: ReactValue<string[]>,
  onToggle: (id: string) => void,
  max: number,
): MenuItem => ({
  name: param.name ?? param.id ?? '',
  noHeader: true,
  minWidth: 220,
  children: (param.options ?? []).map((opt) => {
    const id = (opt.id ?? opt.name) as string;
    return {
      ...optionAsChip(opt),
      keepOpen: true,
      onSelect: () => onToggle(id),
      control: () => <SelectCheck sel={sel} id={id} />,
      disabled: comp(
        [sel],
        ([values]: [string[]]) => !values.includes(id) && values.length >= max,
      ) as SyncStore<boolean>,
    };
  }),
});

export interface MultiSelectMenuProps {
  param: ParamSelect;
  value: unknown;
  onChange: (value: unknown) => void;
  showSearch: boolean;
}

export const MultiSelectMenu: React.FC<MultiSelectMenuProps> = ({param, value, onChange, showSearch}) => {
  const max = selectMax(param);
  const values = React.useMemo(() => readMulti(value, param), [value, param]);

  // A reactive store, created once, kept in sync with the incoming value; it
  // drives the per-row checkbox and disabled state without rebuilding the menu.
  // biome-ignore lint/correctness/useExhaustiveDependencies: initial value only
  const sel = React.useMemo(() => val<string[]>(values), []);
  React.useEffect(() => {
    sel.set(values);
  }, [sel, values]);

  const onChangeRef = React.useRef(onChange);
  onChangeRef.current = onChange;
  const toggle = React.useCallback(
    (id: string) => {
      const cur = sel.getSnapshot();
      const has = cur.includes(id);
      if (!has && cur.length >= max) return; // at capacity — can't add more
      const set = new Set(cur);
      has ? set.delete(id) : set.add(id);
      const next = optionIds(param).filter((x) => set.has(x)); // option order
      sel.set(next);
      onChangeRef.current(next);
    },
    [sel, max, param],
  );

  const menu = React.useMemo(() => buildMultiSelectMenu(param, sel, toggle, max), [param, sel, max, toggle]);
  // Memoize the element so parent re-renders on toggle don't recreate the
  // ContextMenu's state (which would drop the search query / scroll).
  return React.useMemo(
    () => <ContextMenu inset showSearch={showSearch} searchPlaceholder={param.searchPlaceholder} menu={menu} />,
    [menu, showSearch, param.searchPlaceholder],
  );
};
