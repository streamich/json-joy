import * as React from 'react';
import {makeRule, useTheme} from 'nano-theme';

const useBlockClass = makeRule((t) => ({
  ...t.font.ui3,
  col: t.g(0.4),
  fz: '12px',
  d: 'block',
  pad: '8px 24px',
  mar: 0,
  textTransform: 'uppercase',
  letterSpacing: '1px',
}));

export interface CommandPaletteTitleProps {
  contrast?: boolean;
  children?: React.ReactNode;
}

export const CommandPaletteTitle: React.FC<CommandPaletteTitleProps> = ({contrast, children}) => {
  const theme = useTheme();
  const blockClass = useBlockClass();

  return (
    <h5 className={blockClass} style={{color: contrast ? theme.g(0) : undefined}}>
      {children}
    </h5>
  );
};
