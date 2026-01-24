import * as React from 'react';
import {useT} from 'use-t';
import {rule, theme} from 'nano-theme';
import {Typeahead} from '../../../2-inline-block/Typeahead';
import {SpinnerSquare} from '../../../3-list-item/SpinnerSquare';
import {EmptyState} from '../../../4-card/EmptyState';
import {Scrollbox} from '../../../4-card/Scrollbox';
import {CommandPaletteItem} from '../CommandPaletteItem';
import {ItemText} from '../CommandPaletteList/ItemText';
import {CommandArg} from './CommandArg';
import {CommandParameter} from './CommandParameter';

const inputClass = rule({
  ...theme.font.ui3.mid,
  fz: '16px',
  pad: '4px 24px 20px',
});

export interface CommandArgSelectItem {
  id: string;
  name?: string;
  icon?: React.ReactNode;
}

export interface Props {
  value: string;
  list: CommandArgSelectItem[];
  highlight?: string[];
  initializing?: boolean;
  selected: string;
  title?: React.ReactNode;
  label?: React.ReactNode;
  labelValue?: React.ReactNode;
  actionLabel?: React.ReactNode;
  placeholder?: string;
  readonly?: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onClick?: () => void;
  onTabBack?: () => void;
  onDeleteBefore?: () => void;
  onSelect?: (id: string) => void;
  onOptionClick?: (id: string) => void;
  onKeyDown?: () => void;
  onKeyUp?: () => void;
}

export const CommandArgSelect: React.FC<Props> = ({
  value,
  list,
  highlight,
  initializing,
  selected,
  title,
  label,
  labelValue = value,
  placeholder,
  readonly,
  onChange,
  onSubmit,
  onClick,
  onTabBack,
  onDeleteBefore,
  onSelect,
  onOptionClick,
  onKeyDown,
  onKeyUp,
}) => {
  const [t] = useT();

  const active = !readonly;

  return (
    <CommandArg
      title={title}
      right={
        <span style={{fontSize: '1.1em'}}>
          <CommandParameter value={labelValue} label={label} active={active} />
        </span>
      }
      active={active}
      onClick={onClick}
    >
      {!!initializing && <SpinnerSquare />}
      {!initializing && !readonly && (
        <>
          <div className={inputClass}>
            <Typeahead
              autoFocus
              value={value}
              placeholder={placeholder}
              onChange={onChange}
              onEnter={onSubmit}
              onTab={onSubmit}
              onTabBack={onTabBack}
              onDeleteBefore={onDeleteBefore}
              onKeyDown={onKeyDown}
              onKeyUp={onKeyUp}
            />
          </div>
          {!list.length && <EmptyState emoji={' '} title={t('No options')} />}
          {!!list.length && (
            <Scrollbox style={{maxHeight: '400px', overflowY: 'auto'}}>
              {list.map((item) => (
                <CommandPaletteItem
                  key={item.id}
                  selected={selected === item.id}
                  icon={item.icon}
                  actionLabel={t('Select')}
                  onSelect={onSelect ? () => onSelect(item.id) : undefined}
                  onClick={onOptionClick ? () => onOptionClick(item.id) : undefined}
                >
                  <ItemText
                    name={item.name || item.id}
                    highlight={highlight}
                    id={selected === item.id ? item.id : undefined}
                  />
                </CommandPaletteItem>
              ))}
            </Scrollbox>
          )}
        </>
      )}
    </CommandArg>
  );
};
