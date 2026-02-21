import * as React from 'react';
import useWindowSize from 'react-use/lib/useWindowSize';
import {Ripple} from '../../misc/Ripple';
import {Split} from '../../3-list-item/Split';
import {lightTheme as theme, rule, useRule, useTheme} from 'nano-theme';

const iconSize = 24;

const blockClass = rule({
  ...theme.font.ui1.mid,
  fz: '16px',
  d: 'flex',
  w: 'auto',
  alignItems: 'center',
  bd: '1px solid transparent',
  out: 0,
  bg: 'none',
  mar: '0 8px',
  pad: '12px 16px',
  bxz: 'border-box',
  bdrad: '8px',
  cur: 'pointer',
});

const buttonClass = rule({
  d: 'block',
  w: '100%',
  bxz: 'border-box',
  bd: 0,
  out: 0,
  pad: 0,
  mar: 0,
  bg: 'none',
  bdrad: '8px',
  [`& .${blockClass.trim()}`]: {
    mar: 0,
  },
  '&:focus': {
    // boxShadow: `0 0 0 2px ${theme.g(.1)}`,
    boxShadow: `0 0 0 1px ${theme.g(0, 0.1)}`,
    // boxShadow: `0 0 0 1px ${theme.color.sem.positive[1]}`,
  },
});

const iconClass = rule({
  d: 'flex',
  flex: `0 0 ${iconSize}px`,
  alignItems: 'center',
  w: `${iconSize}px`,
  h: `${iconSize}px`,
  mar: '0 8px 0 0',
});

const contentClass = rule({
  d: 'flex',
  alignItems: 'center',
});

const nameClass = rule({
  d: 'flex',
  flex: '1 1 auto',
  alignItems: 'center',
});

const rightClass = rule({
  ...theme.font.sans.mid,
  whiteSpace: 'nowrap',
  padl: '8px',
  fz: '.85em',
  userSelect: 'none',
});

export interface CommandPaletteItemProps {
  button?: boolean;
  autoFocus?: boolean;
  icon?: React.ReactNode;
  selected?: boolean;
  disabled?: boolean;
  actionLabel?: React.ReactNode;
  children?: React.ReactNode;
  onSelect?: () => void;
  onClick?: () => void;
  onDeleteBefore?: () => void;
  onTabBack?: () => void;
}

export const CommandPaletteItem: React.FC<CommandPaletteItemProps> = ({
  button,
  autoFocus,
  icon,
  selected,
  disabled,
  actionLabel,
  children,
  onSelect,
  onClick,
  onDeleteBefore,
  onTabBack,
}) => {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const buttonRef = React.useRef<HTMLButtonElement | HTMLDivElement | null>(null);
  const {width} = useWindowSize();
  const theme = useTheme();

  // Show in viewport selected item.
  React.useEffect(() => {
    if (!selected) return;
    if (!ref.current) return;
    const el = ref.current;
    const rect1 = el.getBoundingClientRect();
    const rect2 = el.parentElement!.getBoundingClientRect();
    if (rect1.y + rect1.height < rect2.y + 16 || rect1.y > rect2.y + rect2.height - 16) {
      el.scrollIntoView({behavior: 'smooth'});
    }
  }, [selected]);

  const selectedBlockClass = useRule((theme) => ({
    bg: theme.g(0, 0.04),
    '&:hover': {
      bd: `1px solid ${theme.g(0, 0.08)}`,
    },
  }));

  React.useEffect(() => {
    const el = buttonRef.current;
    if (!el) return;
    if (autoFocus && typeof el.focus === 'function') {
      el.focus();
    }
  }, [autoFocus]);

  const isSmall = width < 700;

  let element = (
    // biome-ignore lint/a11y/useKeyWithClickEvents: programmatic click handler
    <span
      className={blockClass + (selected ? selectedBlockClass : '')}
      style={{opacity: disabled ? 0.5 : undefined, cursor: disabled ? 'default' : undefined}}
      onMouseEnter={onSelect ? () => onSelect() : undefined}
      onClick={onClick && !button ? () => onClick() : undefined}
    >
      {!!icon && <span className={iconClass}>{icon}</span>}
      <Split as={'span'} className={contentClass}>
        <span className={nameClass}>{children}</span>
        <span className={rightClass} style={{color: theme.g(0.2, 0.7)}}>
          {!isSmall && selected && actionLabel}
        </span>
      </Split>
    </span>
  );

  if (onClick) element = <Ripple>{element}</Ripple>;

  if (button) {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (onDeleteBefore && e.key === 'Backspace') {
        e.preventDefault();
        e.stopPropagation();
        onDeleteBefore();
        return;
      }
      if (onTabBack && e.key === 'Tab' && e.shiftKey) {
        e.preventDefault();
        e.stopPropagation();
        onTabBack();
        return;
      }
    };

    element = (
      <div style={{padding: '0 8px'}}>
        <button
          type="button"
          ref={buttonRef as any}
          className={buttonClass}
          onClick={onClick ? () => onClick() : undefined}
          onKeyDown={handleKeyDown}
        >
          {element}
        </button>
      </div>
    );
  }

  return <div ref={ref as any}>{element}</div>;
};
