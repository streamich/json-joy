import * as React from 'react';
import {drule, useTheme} from 'nano-theme';
import * as css from '../../css';

const blockClass = drule({
  pos: 'relative',
  d: 'flex',
  jc: 'center',
  ai: 'center',
  w: '17px',
  h: '17px',
  bdrad: '2px',
  pad: 0,
  mr: 0,
  out: 0,
  ff: 'monospace',
  lh: '16px',
  cur: 'pointer',
  bd: `1px dotted ${css.blue}`,
  col: css.blue,
  fw: 'normal',
  z: 3,
});

const tooltipClass = drule({
  [`.${blockClass.toString().trim()}:hover &`]: {
    d: 'inline-block',
  },
});

export interface ActionProps {
  className?: string;
  tooltip?: React.ReactNode;
  children?: React.ReactNode;
  onClick?: React.MouseEventHandler;
  onMouseEnter?: React.MouseEventHandler;
  onMouseLeave?: React.MouseEventHandler;
  onMouseOver?: React.MouseEventHandler;
}

export const Action: React.FC<ActionProps> = ({
  className = '',
  tooltip,
  children,
  onClick,
  onMouseEnter,
  onMouseLeave,
  onMouseOver,
}) => {
  const theme = useTheme();

  return (
    <button
      className={
        blockClass({
          bg: theme.bg,
          '&:hover': {
            col: theme.bg,
            bg: css.blue,
          },
          '&:active': {
            col: theme.g(0.9),
            bg: theme.g(0.1),
            bd: `1px solid ${theme.g(0.1)}`,
          },
        }) + className
      }
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onMouseOver={onMouseOver}
    >
      {children}
      {!!tooltip && <span className={css.tooltip + tooltipClass({})}>{tooltip}</span>}
    </button>
  );
};
