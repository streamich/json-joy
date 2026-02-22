import * as React from 'react';
import {rule, useRule, useTheme} from 'nano-theme';

const blockClass = rule({
  pos: 'relative',
  w: '100%',
  h: '100%',
});

const mainInputClass = rule({
  zIndex: 10,
  w: '100%',
  h: '100%',
  pd: 0,
  mr: 0,
  bd: 0,
  out: 0,
  op: 1,
  bg: 'none',
});

const shadowInputClass = rule({
  pe: 'none',
  us: 'none',
  pos: 'absolute',
  z: 5,
  w: '100%',
  h: '100%',
  t: 0,
  l: 0,
  r: 0,
  b: 0,
  pd: 0,
  mr: 0,
  bd: 0,
  out: 0,
  bg: 'none',
  op: 0.35,
  '&:disabled': {
    bg: 'none',
    op: 0.35,
  },
});

export interface Props {
  value: string;
  placeholder?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  onInput?: (input: HTMLInputElement) => void;
  onChange?: (value: string) => void;
  onDeleteBefore?: () => void;
  onKeyUp?: () => void;
  onKeyDown?: () => void;
  onTab?: () => void;
  onTabBack?: () => void;
  onEnter?: () => void;
}

export const Typeahead: React.FC<Props> = ({
  value,
  placeholder,
  autoFocus,
  disabled,
  onInput,
  onChange,
  onDeleteBefore,
  onKeyUp,
  onKeyDown,
  onTab,
  onTabBack,
  onEnter,
}) => {
  const theme = useTheme();
  const ref = React.useRef<HTMLInputElement | null>(null);

  // Set focus on mount.
  React.useEffect(() => {
    if (ref.current) ref.current.focus();
  }, []);

  // Return ref to parent.
  React.useEffect(() => {
    if (onInput && ref.current) onInput(ref.current);
  }, [onInput]);

  const dynamicBlockClass = useRule((theme) => ({
    input: {
      col: theme.g(0, 0.8),
    },
  }));

  const handleChange: React.ChangeEventHandler<HTMLInputElement> | undefined = onChange
    ? (e) => onChange(e.target.value)
    : undefined;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (onDeleteBefore && !value && e.key === 'Backspace') {
      e.preventDefault();
      e.stopPropagation();
      onDeleteBefore();
      return;
    }
    if (onKeyUp && (e.key === 'ArrowUp' || e.key === 'ArrowLeft')) {
      e.preventDefault();
      e.stopPropagation();
      onKeyUp();
      return;
    }
    if (onKeyDown && (e.key === 'ArrowDown' || e.key === 'ArrowRight')) {
      e.preventDefault();
      e.stopPropagation();
      onKeyDown();
      return;
    }
    if (onTabBack && e.key === 'Tab' && e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      onTabBack();
      return;
    }
    if (onTab && e.key === 'Tab') {
      e.preventDefault();
      e.stopPropagation();
      onTab();
      return;
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent) => {
    if (onEnter && e.key === 'Enter') onEnter();
  };

  return (
    <div className={blockClass + dynamicBlockClass}>
      <input
        ref={ref as any}
        disabled={disabled}
        className={mainInputClass}
        value={value}
        style={{textShadow: disabled ? `0 0 2px ${theme.g(0.2, 0.8)}` : undefined}}
        readOnly={!handleChange}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
      />
      {!!placeholder && <input disabled className={shadowInputClass} value={placeholder} readOnly />}
    </div>
  );
};
