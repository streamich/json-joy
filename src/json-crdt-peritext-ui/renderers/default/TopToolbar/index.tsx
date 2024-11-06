// biome-ignore lint: React is used for JSX
import * as React from 'react';
import {rule} from 'nano-theme';
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

// biome-ignore lint: empty interface
export type TopToolbarProps = {};

export const TopToolbar: React.FC<TopToolbarProps> = () => {
  const {ctx} = useDefaultCtx();

  if (!ctx) return null;

  const [complete] = ctx.peritext.overlay.stat(ctx.peritext.editor.cursor);

  const button = (type: string | number, name: React.ReactNode) => (
    <Button
      onClick={() => ctx.dom.et.inline({type})}
      onMouseDown={(e) => e.preventDefault()}
      active={complete.has(type)}
    >{name}</Button>
  );

  return (
    <div className={blockClass}>
      {button('b', 'Bold')}
      {button('i', 'Italic')}
      {button('u', 'Underline')}
    </div>
  );
};
