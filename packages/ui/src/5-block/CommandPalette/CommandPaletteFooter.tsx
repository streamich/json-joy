import * as React from 'react';
import {rule, useTheme} from 'nano-theme';

const height = 32;

const blockClass = rule({
  d: 'block',
  fl: `0 0 ${height}px`,
  h: `${height}px`,
  ai: 'center',
  pd: '0 24px',
  bxz: 'border-box',
});

export interface CommandPaletteFooterProps {
  bg?: boolean;
  children: React.ReactNode;
}

export const CommandPaletteFooter: React.FC<CommandPaletteFooterProps> = ({bg, children}) => {
  const theme = useTheme();

  return (
    <div className={blockClass} style={{color: theme.g(0.4), background: bg ? theme.g(0, 0.04) : undefined}}>
      {children}
    </div>
  );
};
