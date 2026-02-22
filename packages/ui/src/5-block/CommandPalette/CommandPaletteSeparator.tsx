import * as React from 'react';
import {rule} from 'nano-theme';

const height = 64;

const blockClass = rule({
  w: '100%',
  h: `${height}px`,
  bd: '1px solid red',
  bxz: 'border-box',
  pad: '0 16px',
});

export interface CommandPaletteInputProps {
  value: React.ReactNode;
}

export const CommandPaletteInput: React.FC<CommandPaletteInputProps> = ({value}) => {
  return <div className={blockClass}>{value}</div>;
};
