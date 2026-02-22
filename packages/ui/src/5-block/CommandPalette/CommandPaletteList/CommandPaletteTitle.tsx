import * as React from 'react';
import {lightTheme as theme, rule, useTheme} from 'nano-theme';

const blockClass = rule({
  ...theme.font.ui3,
  col: theme.g(0.4),
  fz: '12px',
  d: 'block',
  pad: '8px 24px',
  mar: 0,
  textTransform: 'uppercase',
  letterSpacing: '1px',
});

export interface CommandPaletteTitleProps {
  contrast?: boolean;
  children?: React.ReactNode;
}

export const CommandPaletteTitle: React.FC<CommandPaletteTitleProps> = ({contrast, children}) => {
  const theme = useTheme();

  return (
    <h5 className={blockClass} style={{color: contrast ? theme.g(0) : undefined}}>
      {children}
    </h5>
  );
};
