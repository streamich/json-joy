import * as React from 'react';
import {lightTheme, rule, drule} from 'nano-theme';
import {useStyles} from '../../styles/context';

const blockClass = drule({
  ...lightTheme.font.mono.mid,
  d: 'block',
  bdrad: '5px',
  trs: 'background 0.6s ease 0s',
  fz: '.9em',
  lh: 1.3,
  bd: '1px solid transparent',
  pad: '8px',
  mar: 0,
  ovx: 'auto',
  '@media (max-width: 800px)': {
    pd: '4px',
  },
});

const blockCompactClass = rule({
  pad: `${lightTheme.g(0.2)}px ${lightTheme.g(0.3)}px !important`,
});

export interface CodeblockLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  compact?: boolean;
  children?: React.ReactNode;
}

export const CodeblockLayout: React.FC<CodeblockLayoutProps> = ({compact, children, ...rest}) => {
  const styles = useStyles();
  const cls = blockClass({
    col: styles.g(0.3),
    bg: styles.g(0, 0.02),
    '&:hover': {
      bg: styles.bg + '',
      bd: `1px solid ${styles.g(0, 0.16)}`,
    },
  });

  return (
    <div {...rest} className={cls + (compact ? ' ' + blockCompactClass : '')}>
      {children}
    </div>
  );
};
