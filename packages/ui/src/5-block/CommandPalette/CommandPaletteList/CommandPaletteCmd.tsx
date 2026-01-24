import * as React from 'react';
import {useT} from 'use-t';
import {CommandIcon} from '../CommandIcon';
import {CommandPaletteItem} from '../CommandPaletteItem';
import type {CommandPaletteCmdItem} from '../types';
import {ItemText} from './ItemText';

export interface CommandPaletteCmdProps extends CommandPaletteCmdItem {
  selected?: boolean;
  highlight?: string[];
  disabled?: boolean;
  onSelect?: () => void;
  onClick?: () => void;
}

export const CommandPaletteCmd: React.FC<CommandPaletteCmdProps> = ({
  icon,
  id,
  name,
  actionLabel,
  hasArgs,
  selected,
  highlight,
  disabled,
  onSelect,
  onClick,
}) => {
  const [t] = useT();

  return (
    <CommandPaletteItem
      icon={<CommandIcon {...icon} />}
      actionLabel={actionLabel || (hasArgs ? t('Configure command') : t('Run command'))}
      disabled={disabled}
      selected={selected}
      onSelect={onSelect}
      onClick={onClick}
    >
      <ItemText name={name} highlight={highlight} ellipsis={hasArgs} id={selected ? id : undefined} />
    </CommandPaletteItem>
  );
};
