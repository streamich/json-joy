import * as React from 'react';
import {theme, drule, useTheme} from 'nano-theme';

const blockClass = drule({
  ...theme.font.mono,
  fz: '10px',
  lh: '9px',
  col: theme.color.sem.blue[0],
  d: 'inline-block',
  pd: '2px 2px',
  mr: '0',
  bxz: 'border-box',
  // bg: 'transparent',
  bd: 0,
  bdrad: '1em',
});

export interface TypeSwitchProps {
  value: React.ReactNode;
  onClick?: React.MouseEventHandler;
  onKeyDown?: React.KeyboardEventHandler;
}

export const TypeSwitch: React.FC<TypeSwitchProps> = React.memo(({value, onKeyDown, onClick}) => {
  const theme = useTheme();

  return (
    <button
      className={blockClass({
        bg: theme.g(0.96),
        '&:hover': {
          bg: theme.g(0.88),
        },
      })}
      onClick={onClick}
      onKeyDown={onKeyDown}
    >
      {value}
    </button>
  );
});
