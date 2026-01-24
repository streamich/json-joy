import {Group} from 'libreact/lib/Group';
import * as React from 'react';
import {rule} from 'nano-theme';
import {CommandPaletteCmd} from './CommandPaletteCmd';
import {CommandPaletteTitle} from './CommandPaletteTitle';
import type {CommandPaletteCmdGroup, CommandPaletteCmdRef} from '../types';
import {Scrollbox} from '../../../4-card/Scrollbox';
import {Separator} from '../../../3-list-item/Separator';

const scrollClass = rule({
  d: 'flex',
  flex: '1 1 100%',
  w: '100%',
  maxH: '100%',
  ov: 'hidden',
  // h: '100%',
});

const groupClass = rule({
  d: 'block',
  w: '100%',
  pad: '8px 0',
});

export interface CommandPaletteListProps {
  list: CommandPaletteCmdGroup[];
  selected?: null | CommandPaletteCmdRef;
  highlight?: string[];
  disabled?: boolean;
  onSelect?: (item: CommandPaletteCmdRef) => void;
  onRun?: (cmd: CommandPaletteCmdRef) => void;
}

export const CommandPaletteList: React.FC<CommandPaletteListProps> = ({
  list,
  selected,
  highlight,
  disabled,
  onSelect,
  onRun,
}) => {
  return (
    <div className={scrollClass}>
      <Scrollbox>
        <Group className={groupClass} separator={<Separator hard style={{margin: '8px 0'}} />}>
          {list.map((group) => (
            <div key={group.id}>
              <CommandPaletteTitle>{group.name}</CommandPaletteTitle>
              {group.list.map((item) => (
                <CommandPaletteCmd
                  key={item.id}
                  {...item}
                  selected={!!(selected && selected[0] === group.id && selected[1] === item.id)}
                  highlight={highlight}
                  disabled={disabled}
                  onSelect={disabled ? undefined : onSelect ? () => onSelect([group.id, item.id]) : undefined}
                  onClick={disabled ? undefined : onRun ? () => onRun([group.id, item.id]) : undefined}
                />
              ))}
            </div>
          ))}
        </Group>
      </Scrollbox>
    </div>
  );
};
