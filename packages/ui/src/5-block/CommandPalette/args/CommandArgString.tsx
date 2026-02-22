import * as React from 'react';
import {useT} from 'use-t';
import {Typeahead} from '../../../2-inline-block/Typeahead';
import {BasicTooltip} from '../../../4-card/BasicTooltip';
import {Iconista} from '../../../icons/Iconista';
import {CommandPaletteItem} from '../CommandPaletteItem';
import {CommandArg} from './CommandArg';
import {CommandParameter} from './CommandParameter';

const icon = (
  <BasicTooltip renderTooltip={() => 'string'}>
    <Iconista set="elastic" icon="string" width={16} height={16} />
  </BasicTooltip>
);

export interface Props {
  title?: React.ReactNode;
  label?: React.ReactNode;
  actionLabel?: React.ReactNode;
  value: string;
  placeholder?: string;
  readonly?: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onClick?: () => void;
  onTabBack?: () => void;
  onDeleteBefore?: () => void;
}

export const CommandArgString: React.FC<Props> = ({
  title,
  label,
  actionLabel,
  value,
  placeholder,
  readonly,
  onChange,
  onSubmit,
  onClick,
  onTabBack,
  onDeleteBefore,
}) => {
  const [t] = useT();

  const active = !readonly;

  return (
    <CommandArg
      title={title}
      right={
        <span style={{fontSize: '1.1em'}}>
          <CommandParameter value={value} label={label} active={active} />
        </span>
      }
      active={active}
      onClick={onClick}
    >
      {!readonly && (
        <CommandPaletteItem selected={!readonly} icon={icon} actionLabel={actionLabel || t('Submit')}>
          <Typeahead
            autoFocus
            value={value}
            placeholder={placeholder}
            onChange={onChange}
            onEnter={onSubmit}
            onTab={onSubmit}
            onTabBack={onTabBack}
            onDeleteBefore={onDeleteBefore}
          />
        </CommandPaletteItem>
      )}
    </CommandArg>
  );
};
