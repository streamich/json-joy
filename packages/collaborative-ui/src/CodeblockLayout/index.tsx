import * as React from 'react';
import {rule, theme, useRule} from 'nano-theme';

const blockClass = rule({
  ...theme.font.mono.mid,
  d: 'block',
  bdrad: '5px',
  trs: 'background 0.6s ease 0s',
  fz: '.9em',
  lh: 1.3,
  bd: '1px solid transparent',
  pad: '8px',
  mar: 0,
  ovx: 'auto',
});

const blockCompactClass = rule({
  pad: `${theme.g(0.2)}px ${theme.g(0.3)}px !important`,
});

export interface CodeblockLayoutProps {
  compact?: boolean;
  children?: React.ReactNode;
}

export const CodeblockLayout: React.FC<CodeblockLayoutProps> = ({compact, children}) => {
  const dynamicBlockClass = useRule((theme) => ({
    col: theme.g(0.3),
    bg: theme.g(0, 0.02),
    '&:hover': {
      bg: theme.bg,
      bd: `1px solid ${theme.g(0, 0.16)}`,
    },
  }));

  return <div className={blockClass + dynamicBlockClass + (compact ? blockCompactClass : '')}>{children}</div>;
};
