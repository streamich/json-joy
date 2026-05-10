import * as React from 'react';
import {drule} from 'nano-theme';
import {useStyles} from '../../styles/context';

const className = drule({
  h: '2px',
  bgs: '102px 2px',
  an: 'bg-running 2s infinite linear',
  '@keyframes bg-running': {
    '0%': {
      bgp: '0 0',
    },
    '100%': {
      bgp: '102px 0',
    },
  },
});

export const RunningBackground: React.FC<any> = ({children}) => {
  const styles = useStyles();
  const base = styles.g(0.86);
  const stripe = styles.g(0.8);
  return (
    <div
      className={className({
        bg: `repeating-linear-gradient(45deg, ${base} 0, ${base} 4px, ${stripe} 4px, ${stripe} 8px)`,
      })}
    >
      {children}
    </div>
  );
};
