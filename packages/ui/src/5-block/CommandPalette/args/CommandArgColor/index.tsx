import * as React from 'react';
import {HexColorPicker} from 'react-colorful';
import {Typeahead} from '../../../../2-inline-block/Typeahead';
import {BasicTooltip} from '../../../../4-card/BasicTooltip';
import {Iconista} from '../../../../icons/Iconista';
import {CommandPaletteItem} from '../../CommandPaletteItem';
import {CommandArg} from '../CommandArg';
import {Parameter} from './Parameter';

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

export const CommandArgColor: React.FC<Props> = ({
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
  const inputRef = React.useRef<HTMLInputElement>(null);

  const active = !readonly;

  const handleMouseUp = () => {
    const input = inputRef.current;
    if (!input) return;
    input.focus();
  };

  return (
    <CommandArg
      title={title}
      right={
        <span style={{fontSize: '1.1em'}}>
          <Parameter value={value} label={label} active={active} />
        </span>
      }
      active={active}
      onClick={onClick}
    >
      {!readonly && (
        <>
          <CommandPaletteItem selected icon={icon} actionLabel={actionLabel || 'Submit'}>
            <Typeahead
              autoFocus
              value={value}
              placeholder={placeholder}
              onChange={onChange}
              onEnter={onSubmit}
              onTab={onSubmit}
              onTabBack={onTabBack}
              onDeleteBefore={onDeleteBefore}
              onInput={(input) => ((inputRef as any).current = input)}
            />
          </CommandPaletteItem>
          <div style={{padding: '16px 24px 0', display: 'flex', justifyContent: 'center'}}>
            <HexColorPicker
              style={{width: '100%', maxWidth: 480, height: 180}}
              color={value}
              onChange={onChange}
              onTouchEnd={handleMouseUp}
              onMouseUp={handleMouseUp}
            />
          </div>
        </>
      )}
    </CommandArg>
  );
};
