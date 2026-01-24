import * as React from 'react';
import {rule, makeRule, theme} from 'nano-theme';

export const color = '#430';

const blockClass = rule({
  ...theme.font.mono.bold,
  fz: '0.96em',
  pad: '0px 0.33em !important',
  mar: '-4px -1px',
  bdrad: '.24em',
  col: color,
  letterSpacing: '-0.025em',
  cur: 'alias',
});

const useBlockClass = makeRule((theme) => ({
  bd: `.08em solid ${theme.g(0, 0.08)}`,
  '&:hover': {
    bd: `.08em solid ${theme.g(0, 0.16)}`,
    col: theme.g(0.2),
  },
  '&:active': {
    bd: `.08em solid ${theme.g(0, 0.32)}`,
    col: theme.g(0),
  },
}));

const GenericInlineCode: React.FC<React.AllHTMLAttributes<any>> = (props) => {
  const dynamicBlockClass = useBlockClass();

  return <code {...props} className={blockClass + dynamicBlockClass} />;
};

export default GenericInlineCode;
