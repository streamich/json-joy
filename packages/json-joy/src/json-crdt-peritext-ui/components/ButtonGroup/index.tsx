// biome-ignore lint: React is used for JSX
import * as React from 'react';
import {rule} from 'nano-theme';

const blockClass = rule({
  d: 'flex',
  flw: 'wrap',
  columnGap: '4px',
  rowGap: '4px',
  w: '100%',
  maxW: '100%',
  bxz: 'border-box',
  ff: 'Inter, ui-sans-serif, system-ui, -apple-system, "system-ui", "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
  lh: '24px',
  mr: 0,
});

export interface ButtonGroup extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export const ButtonGroup: React.FC<ButtonGroup> = ({children, ...rest}) => {
  return (
    <div {...rest} className={(rest.className || '') + blockClass}>
      {children}
    </div>
  );
};
