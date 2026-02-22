import * as React from 'react';
import {rule} from 'nano-theme';

const blockClass = rule({
  d: 'flex',
  flexDirection: 'column',
  w: '90vw',
  maxW: '800px',
  maxH: '1000px',
  minW: '300px',
  minH: '200px',
});

export interface CommandPaletteProps {
  children: React.ReactNode;
}

export const CommandPaletteSizer: React.FC<CommandPaletteProps> = ({children}) => {
  return <div className={blockClass}>{children}</div>;
};
