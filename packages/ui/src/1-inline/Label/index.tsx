import * as React from 'react';
import {lightTheme, drule} from 'nano-theme';
import {useStyles} from '../../styles/context';

const blockClass = drule({
  ...lightTheme.font.ui1.mid,
  d: 'inline-flex',
  b: 0,
  mar: 0,
  bd: 0,
  justifyContent: 'space-between',
  alignItems: 'center',
  bxz: 'border-box',
  pad: '.3em .5em',
  bdrad: '.7em',
  '&+&': {
    marl: '8px',
  },
});

export interface LabelProps {
  /** Tint the chip with the theme's neutral color instead of plain grey. */
  tint?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const Label: React.FC<LabelProps> = ({tint, className, children}) => {
  const styles = useStyles();
  const light = styles.light;
  const g = tint ? (c: number, a?: number) => styles.neutral.g(c, a) : styles.g;

  return (
    <span
      className={
        blockClass({
          col: g(0.25),
          bg: g(0, 0.06),
          boxShadow: light ? 'none' : `0 0 0 1px ${g(0.1, 0.16)}`,
          '&:hover': {
            col: g(0.25),
            bg: g(0.92),
            boxShadow: light ? 'none' : `0 0 0 1px ${g(0.1, 0.24)}`,
          },
        }) + (className ? ` ${className}` : '')
      }
    >
      {children}
    </span>
  );
};
