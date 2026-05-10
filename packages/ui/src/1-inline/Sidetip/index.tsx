import * as React from 'react';
import {lightTheme, rule, drule} from 'nano-theme';
import {useStyles} from '../../styles/context';

const blockClass = drule({
  ...lightTheme.font.ui3.mid,
  fz: '15px',
  letterSpacing: '-0.025em',
});

const blockSmallClass = rule({
  ...lightTheme.font.ui1.mid,
  fz: '13px',
});

export interface Props {
  small?: boolean;
  children?: React.ReactNode;
}

export const Sidetip: React.FC<Props> = ({small, children}) => {
  const styles = useStyles();
  return (
    <span className={blockClass({col: styles.g(0.5)}) + (small ? ' ' + blockSmallClass : '')}>{children}</span>
  );
};
