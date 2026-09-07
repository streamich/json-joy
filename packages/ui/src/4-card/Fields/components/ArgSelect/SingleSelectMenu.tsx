import * as React from 'react';
import {Iconista} from '../../../../icons/Iconista';
import {ContextMenu} from '../../../ContextMenu/ContextMenu';
import type {MenuItem, ParamSelect} from '../../../StructuralMenu/types';
import {optionAsChip, selectArg} from './utils';

/** Single-select options menu: picking closes the menu; current selection checked. */
export const buildSelectMenu = (param: ParamSelect, selectedId: string, onPick: (id: string) => void): MenuItem => ({
  name: param.name ?? param.id ?? '',
  noHeader: true,
  minWidth: 220,
  children: (param.options ?? []).map((opt) => {
    const id = opt.id ?? opt.name;
    const isSelected = id === selectedId;
    return {
      ...optionAsChip(opt),
      onSelect: () => onPick(id ?? ''),
      right: isSelected ? () => <Iconista width={14} height={14} set="radix" icon="check" /> : opt.right,
    };
  }),
});

export interface SingleSelectMenuProps {
  param: ParamSelect;
  value: unknown;
  onChange: (value: unknown) => void;
  showSearch: boolean;
}

export const SingleSelectMenu: React.FC<SingleSelectMenuProps> = ({param, value, onChange, showSearch}) => {
  const {s, setValue} = selectArg(param, value as never, onChange as never);
  // biome-ignore lint/correctness/useExhaustiveDependencies: setValue identity not material
  const menu = React.useMemo(() => buildSelectMenu(param, s.value, setValue), [param, s.value]);
  return <ContextMenu inset showSearch={showSearch} searchPlaceholder={param.searchPlaceholder} menu={menu} />;
};
