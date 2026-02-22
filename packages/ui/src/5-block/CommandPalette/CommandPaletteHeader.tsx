import * as React from 'react';
import {rule, theme, useTheme} from 'nano-theme';

const height = 32;

const blockClass = rule({
  ...theme.font.ui2.mid,
  d: 'flex',
  fl: `0 0 ${height}px`,
  ai: 'center',
  fd: 'row-reverse',
  h: `${height}px`,
  fz: '12px',
  pd: '0 24px',
  bxz: 'border-box',
});

export interface CommandPaletteHeaderProps {
  bg?: boolean;
  left?: boolean;
  children: React.ReactNode;
}

export const CommandPaletteHeader: React.FC<CommandPaletteHeaderProps> = ({bg, left, children}) => {
  const theme = useTheme();

  return (
    <div
      className={blockClass}
      style={{
        color: theme.g(0.4),
        background: bg ? theme.g(0, 0.04) : undefined,
        flexDirection: left ? 'row' : undefined,
      }}
    >
      {children}
    </div>
  );
};
