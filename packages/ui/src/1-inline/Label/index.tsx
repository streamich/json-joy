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
  className?: string;
  children: React.ReactNode;
}

export const Label: React.FC<LabelProps> = ({className, children}) => {
  const styles = useStyles();
  const light = styles.light;

  return (
    <span
      className={
        blockClass({
          col: styles.g(0.25),
          bg: styles.g(0, 0.06),
          boxShadow: light ? 'none' : `0 0 0 1px ${styles.g(0.1, 0.16)}`,
          '&:hover': {
            col: styles.g(0.25),
            bg: styles.g(0.92),
            boxShadow: light ? 'none' : `0 0 0 1px ${styles.g(0.1, 0.24)}`,
          },
        }) + (className ? ` ${className}` : '')
      }
    >
      {children}
    </span>
  );
};
