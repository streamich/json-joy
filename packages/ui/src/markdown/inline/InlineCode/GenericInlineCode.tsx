import * as React from 'react';
import {makeRule} from 'nano-theme';

export const color = '#430';

const useBlockClass = makeRule((t) => ({
  ...t.font.mono.bold,
  fz: '0.96em',
  pad: '0px 0.33em !important',
  mar: '-4px -1px',
  bdrad: '.24em',
  col: t.isLight ? color : '#ffd9a8',
  letterSpacing: '-0.025em',
  cur: 'alias',
  bd: `.08em solid ${t.g(0, 0.08)}`,
  '&:hover': {
    bd: `.08em solid ${t.g(0, 0.16)}`,
    col: t.isLight ? t.g(0.2) : '#ffe6c4',
  },
  '&:active': {
    bd: `.08em solid ${t.g(0, 0.32)}`,
    col: t.isLight ? t.g(0) : '#fff',
  },
}));

const GenericInlineCode: React.FC<React.AllHTMLAttributes<any>> = (props) => {
  const blockClass = useBlockClass();

  return <code {...props} className={blockClass} />;
};

export default GenericInlineCode;
