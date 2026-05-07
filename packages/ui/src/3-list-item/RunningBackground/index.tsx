import * as React from 'react';
import {makeRule} from 'nano-theme';

const useClassName = makeRule((t) => {
  const base = t.g(0.86);
  const stripe = t.g(0.8);
  return {
    h: '2px',
    bg: `repeating-linear-gradient(45deg, ${base} 0, ${base} 4px, ${stripe} 4px, ${stripe} 8px)`,
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
  };
});

export const RunningBackground: React.FC<any> = ({children}) => {
  const className = useClassName();
  return <div className={className}>{children}</div>;
};
