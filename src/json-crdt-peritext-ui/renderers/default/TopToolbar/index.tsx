import {rule} from 'nano-theme';
import * as React from 'react';
import {Button} from '../Button';

const blockClass = rule({
  d: 'flex',
  columnGap: '4px',
  bxz: 'border-box',
  fw: 'wrap',
  ff: 'Inter, ui-sans-serif, system-ui, -apple-system, "system-ui", "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
  lh: '24px',
  mr: 0,
});

export interface TopToolbarProps {}

export const TopToolbar: React.FC<TopToolbarProps> = () => {
  return (
    <div className={blockClass}>
      <Button>Bold</Button>
      <Button>Italic</Button>
    </div>
  );
};