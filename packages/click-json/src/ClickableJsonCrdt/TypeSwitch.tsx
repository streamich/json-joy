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
  bg: 'transparent',
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
        bd: `1px solid ${theme.blue(0.25)}`,
        '&:hover': {
          bd: `1px solid ${theme.blue(0.7)}`,
        },
      })}
      onClick={onClick}
      onKeyDown={onKeyDown}
    >
      {value}
    </button>
  );
});
