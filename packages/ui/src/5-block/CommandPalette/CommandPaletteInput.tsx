import * as React from 'react';
import useWindowSize from 'react-use/lib/useWindowSize';
import {useT} from 'use-t';
import {rule, theme, useTheme} from 'nano-theme';
import BasicButton from '../../2-inline-block/BasicButton';
import {SpinnerCircle} from '../../2-inline-block/SpinnerCircle';
import {Typeahead} from '../../2-inline-block/Typeahead';
import {Progress} from '../../3-list-item/Progress';
import {BasicTooltip} from '../../4-card/BasicTooltip';
import {Iconista} from '../../icons/Iconista';

const height = 64;

const blockClass = rule({
  ...theme.font.ui3.mid,
  fz: '16px',
  d: 'flex',
  flex: `0 0 ${height}px`,
  h: `${height}px`,
  w: '100%',
  bxz: 'border-box',
});

const iconLeftClass = rule({
  d: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  w: '54px',
  marl: '8px',
});

const iconRightClass = rule({
  d: 'flex',
  flexDirection: 'row-reverse',
  alignItems: 'center',
  w: '54px',
  marr: '8px',
});

const beforeClass = rule({
  d: 'flex',
  alignItems: 'center',
});

const contentClass = rule({
  d: 'flex',
  flex: '1 1 auto',
  alignItems: 'center',
});

export interface CommandPaletteInputProps {
  progress?: number;
  icon?: React.ReactNode;
  before?: React.ReactNode;
  value?: string;
  placeholder?: string;
  loading?: boolean;
  disabled?: boolean;
  children?: React.ReactNode;
  onChange?: (value: string) => void;
  onDeleteBefore?: () => void;
  onKeyUp?: () => void;
  onKeyDown?: () => void;
  onClear?: () => void;
  onComplete?: () => void;
  onEnter?: () => void;
}

export const CommandPaletteInput: React.FC<CommandPaletteInputProps> = ({
  progress,
  icon,
  before,
  value,
  children,
  placeholder,
  loading,
  disabled,
  onChange,
  onDeleteBefore,
  onKeyUp,
  onKeyDown,
  onClear,
  onComplete,
  onEnter,
}) => {
  const [t] = useT();
  const theme = useTheme();
  const {width} = useWindowSize();

  const handleClearKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowUp':
      case 'ArrowRight':
      case 'ArrowDown':
      case 'ArrowLeft': {
        e.preventDefault();
        if (typeof (e.target as any)?.blur === 'function') (e.target as any).blur();
      }
    }
  };

  const handleClearClick = (e: React.MouseEvent) => {
    if (typeof (e.target as any)?.blur === 'function') (e.target as any).blur();
    onClear?.();
  };

  const isSmall = width < 500;

  const progressElement = typeof progress === 'number' && (
    <div style={{position: 'absolute', top: 0, left: 0, right: 0}}>
      <Progress value={progress} glow />
    </div>
  );

  return (
    <div className={blockClass} style={{borderBottom: `1px solid ${theme.g(0.1, 0.2)}`}}>
      {progressElement}
      {isSmall ? (
        <div style={{width: 24}} />
      ) : (
        <div className={iconLeftClass}>
          {loading ? <SpinnerCircle /> : icon ? icon : <Iconista set="ibm_16" icon="search" width={20} height={20} />}
        </div>
      )}
      {!!before && <div className={beforeClass}>{before}&nbsp;</div>}
      <div className={contentClass}>
        {children ? (
          children
        ) : (
          <Typeahead
            value={value || ''}
            placeholder={placeholder}
            disabled={disabled}
            onChange={onChange}
            onDeleteBefore={onDeleteBefore}
            onKeyUp={onKeyUp}
            onKeyDown={onKeyDown}
            onTab={onComplete}
            onEnter={onEnter}
          />
        )}
      </div>
      <div className={iconRightClass}>
        {!!onClear && (
          <BasicTooltip renderTooltip={() => t('Clear selection')} nowrap>
            <BasicButton size={48} round disabled={disabled} onClick={handleClearClick} onKeyDown={handleClearKeyDown}>
              <Iconista set="ibm_16" icon="misuse" width={20} height={20} />
            </BasicButton>
          </BasicTooltip>
        )}
      </div>
    </div>
  );
};
