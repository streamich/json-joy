import * as React from 'react';
import {rule, theme, makeRule} from 'nano-theme';

const blockClass = rule({
  ...theme.font.ui3.mid,
  fz: '15px',
  letterSpacing: '-0.025em',
});

const blockSmallClass = rule({
  ...theme.font.ui1.mid,
  fz: '13px',
});

const useBlockClass = makeRule((theme) => ({
  col: theme.g(0.7),
}));

export interface Props {
  small?: boolean;
  children?: React.ReactNode;
}

export const Sidetip: React.FC<Props> = ({small, children}) => {
  const dynamicBlockClass = useBlockClass();

  return <span className={blockClass + (small ? blockSmallClass : '') + dynamicBlockClass}>{children}</span>;
};
