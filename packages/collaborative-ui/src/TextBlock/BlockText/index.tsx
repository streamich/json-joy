import * as React from 'react';
import {rule, theme} from 'nano-theme';

const css = {
  block: rule({
    ...theme.font.mono.mid,
    fz: '12px',
    pad: '0 8px',
    mar: 0,
    pre: {
      mar: 0,
      pad: 0,
    },
  }),
};

export interface BlockTextProps {
  src: string;
  compact?: boolean;
}

export const BlockText: React.FC<BlockTextProps> = ({src, compact}) => {
  const style: React.CSSProperties = {
    padding: compact ? '0' : undefined,
    fontSize: compact ? '11px' : undefined,
  };

  return (
    <pre className={css.block} style={style}>
      <code>{src}</code>
    </pre>
  );
};
