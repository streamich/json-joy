import * as React from 'react';
import {makeRule} from 'nano-theme';

const height = 64;

const useBlockClass = makeRule((t) => ({
  w: '100%',
  h: `${height}px`,
  bd: `1px solid ${t.g(0, 0.1)}`,
  bxz: 'border-box',
  pad: '0 16px',
}));

export interface CommandPaletteInputProps {
  value: React.ReactNode;
}

export const CommandPaletteInput: React.FC<CommandPaletteInputProps> = ({value}) => {
  const blockClass = useBlockClass();
  return <div className={blockClass}>{value}</div>;
};
