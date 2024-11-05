import {rule} from 'nano-theme';
import * as React from 'react';
import {Button} from '../Button';
import {useDefaultCtx} from '../context';

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
  const {ctx} = useDefaultCtx();

  if (!ctx) return null;

  return (
    <div className={blockClass}>
      <Button onClick={() => ctx.dom.et.inline({type: 'b'})}>Bold</Button>
      <Button>Italic</Button>
    </div>
  );
};