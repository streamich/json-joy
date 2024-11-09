// biome-ignore lint: React is used for JSX
import * as React from 'react';
import {rule} from 'nano-theme';
import {Button} from '../Button';
import {useDefaultCtx} from '../context';
import {CommonSliceType} from '../../../../json-crdt-extensions';

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

// biome-ignore lint: empty interface
export type TopToolbarProps = {};

export const TopToolbar: React.FC<TopToolbarProps> = () => {
  const {ctx} = useDefaultCtx();

  if (!ctx) return null;

  const [complete] = ctx.peritext.overlay.stat(ctx.peritext.editor.cursor);

  const button = (type: string | number, name: React.ReactNode) => (
    <Button
      onClick={() => ctx.dom.et.format(type)}
      onMouseDown={(e) => e.preventDefault()}
      active={complete.has(type)}
    >
      {name}
    </Button>
  );

  return (
    <div className={blockClass}>
      {button(CommonSliceType.b, 'Bold')}
      {button(CommonSliceType.i, 'Italic')}
      {button(CommonSliceType.u, 'Underline')}
      {button(CommonSliceType.s, 'Strikethrough')}
      {button(CommonSliceType.code, 'Code')}
      {button(CommonSliceType.mark, 'Mark')}
      {button(CommonSliceType.del, 'Deleted')}
      {button(CommonSliceType.ins, 'Inserted')}
      {button(CommonSliceType.sup, 'Superscript')}
      {button(CommonSliceType.sub, 'Subscript')}
      {button(CommonSliceType.math, 'Math')}
      {button(CommonSliceType.hidden, 'Spoiler')}
      {button(CommonSliceType.bookmark, 'Bookmark')}
    </div>
  );
};
