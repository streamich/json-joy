import * as React from 'react';
import {lightTheme, drule} from 'nano-theme';
import {useStyles} from '../../../styles/context';

export const color = '#430';

const blockClass = drule({
  ...lightTheme.font.mono.bold,
  fz: '0.96em',
  pad: '0px 0.33em !important',
  mar: '-4px -1px',
  bdrad: '.24em',
  letterSpacing: '-0.025em',
  cur: 'alias',
});

const GenericInlineCode: React.FC<React.AllHTMLAttributes<any>> = (props) => {
  const styles = useStyles();
  const light = styles.light;
  const cls = blockClass({
    col: light ? color : '#ffd9a8',
    bd: `.08em solid ${styles.g(0, 0.08)}`,
    '&:hover': {
      bd: `.08em solid ${styles.g(0, 0.16)}`,
      col: light ? styles.g(0.2) : '#ffe6c4',
    },
    '&:active': {
      bd: `.08em solid ${styles.g(0, 0.32)}`,
      col: light ? styles.g(0) : '#fff',
    },
  });

  return <code {...props} className={cls} />;
};

export default GenericInlineCode;
