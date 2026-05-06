import * as React from 'react';
import {makeRule} from 'nano-theme';

const useBlockClass = makeRule((t) => ({
  ...t.font.ui3.mid,
  fz: '15px',
  letterSpacing: '-0.025em',
  col: t.g(0.5),
}));

const useBlockSmallClass = makeRule((t) => ({
  ...t.font.ui1.mid,
  fz: '13px',
}));

export interface Props {
  small?: boolean;
  children?: React.ReactNode;
}

export const Sidetip: React.FC<Props> = ({small, children}) => {
  const blockClass = useBlockClass();
  const blockSmallClass = useBlockSmallClass();

  return <span className={blockClass + (small ? blockSmallClass : '')}>{children}</span>;
};
