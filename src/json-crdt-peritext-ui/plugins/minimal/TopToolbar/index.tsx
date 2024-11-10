// biome-ignore lint: React is used for JSX
import * as React from 'react';
import {Button} from '../../../components/Button';
import {useDefaultCtx} from '../context';
import {CommonSliceType} from '../../../../json-crdt-extensions';
import {ButtonGroup} from '../../../components/ButtonGroup';

// biome-ignore lint: empty interface
export type TopToolbarProps = {};

export const TopToolbar: React.FC<TopToolbarProps> = () => {
  const {ctx} = useDefaultCtx();

  if (!ctx) return null;

  const [complete] = ctx.peritext.overlay.stat(ctx.peritext.editor.cursor);

  const button = (type: string | number, name: React.ReactNode) => (
    <Button onClick={() => ctx.dom.et.format(type)} onMouseDown={(e) => e.preventDefault()} active={complete.has(type)}>
      {name}
    </Button>
  );

  const button2 = (name: React.ReactNode, onClick: React.MouseEventHandler) => (
    <Button onClick={onClick} onMouseDown={(e) => e.preventDefault()}>
      {name}
    </Button>
  );

  return (
    <ButtonGroup>
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
      {button2('Erase', () => {
        ctx.dom.et.format({behavior: 'erase'});
      })}
      {button2('Clear', () => {
        ctx.dom.et.format({behavior: 'clear'});
      })}
    </ButtonGroup>
  );
};
