import * as React from 'react';
import {drule} from 'nano-theme';
import {fonts} from '../../styles';
import {useStyles} from '../../styles/context';

const keyClass = drule({
  ...fonts.get('mono', 'bold', 0),
  d: 'inline-block',
  mr: '0 .1em',
  pd: '.4em .6em',
  bdrad: '.3em',
  lh: '1em',
  fz: '.75em',
  ws: 'pre',
  va: 'middle',
});

export interface KeyProps {
  children: React.ReactNode;
}

export const Key: React.FC<KeyProps> = ({children}) => {
  const styles = useStyles();

  const dyn = styles.light
    ? {
        col: styles.g(0),
        // bg: 'rgba(255,255,255,0.7)',
        bg: styles.neutral.fg.pct(0, -.9, .95),
        bd: `1px solid ${styles.g(0.8)}`,
        bdb: `2px solid ${styles.g(0.6)}`,
        bxsh: `0 1px 2px ${styles.g(0.2, 0.1)}`,
      }
    : {
        col: styles.g(0.05),
        // bg: styles.g(0.85),
        bg: styles.neutral.fg.pct(0, -.7, .9),
        bd: `1px solid ${styles.g(0.8)}`,
        bdb: `2px solid ${styles.g(0.55)}`,
        bxsh: `0 1px 2px rgba(0,0,0,0.5)`,
      };

  return <kbd className={keyClass(dyn as any)}>{children}</kbd>;
};
