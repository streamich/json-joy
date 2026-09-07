import {drule} from 'nano-theme';
import * as React from 'react';
import {useRoundnessTrace} from '../../context/traces';
import {useStyles} from '../../styles/context';
import {buttonRadiusFor} from './metrics';

/**
 * Shared "ghost" surface used by both cells of a field row: the definition
 * cell's manage button and the value cell's reveal trigger.
 */
export const ghostBtnClass = drule({
  d: 'flex',
  ai: 'center',
  gap: '8px',
  h: '100%',
  minWidth: 0,
  bxz: 'border-box',
  bd: 0,
  bg: 'transparent',
  out: 0,
  cur: 'pointer',
  ta: 'start',
  us: 'none',
  bdrad: '5px',
  pd: '0 6px',
  trs: 'background .12s',
});

export interface FieldGhostButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const FieldGhostButton: React.FC<FieldGhostButtonProps> = ({style, children, ...rest}) => {
  const styles = useStyles();
  const radius = buttonRadiusFor(useRoundnessTrace(0.5) ?? 0.5);
  return (
    <button
      type="button"
      {...rest}
      className={ghostBtnClass({
        bdrad: `${radius}px`,
        '&:hover': {bg: styles.g(0, 0.06)},
        '&:focus-visible': {bg: styles.g(0, 0.06)},
        '&:active': {bg: styles.g(0, 0.1)},
      })}
      style={style}
    >
      {children}
    </button>
  );
};
