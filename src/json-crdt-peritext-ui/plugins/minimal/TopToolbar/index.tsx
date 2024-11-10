// biome-ignore lint: React is used for JSX
import * as React from 'react';
import {Button} from '../../../components/Button';
import {CommonSliceType} from '../../../../json-crdt-extensions';
import {ButtonGroup} from '../../../components/ButtonGroup';
import {useSyncStore} from '../../../react/hooks';
import type {PeritextSurfaceContextValue} from '../../../react';

export interface TopToolbarProps {
  ctx: PeritextSurfaceContextValue;
}

export const TopToolbar: React.FC<TopToolbarProps> = ({ctx}) => {
  const pending = useSyncStore(ctx.peritext.editor.pending);

  const [complete] = ctx.peritext.overlay.stat(ctx.peritext.editor.cursor);

  const button = (type: string | number, name: React.ReactNode) => (
    <Button
      onClick={() => ctx.dom.et.format(type)}
      onMouseDown={(e) => e.preventDefault()}
      active={(complete.has(type) && !pending.has(type)) || (!complete.has(type) && pending.has(type))}
    >
      {name}
    </Button>
  );

  const button2 = (name: React.ReactNode, onClick: React.MouseEventHandler) => (
    <Button onClick={onClick} onMouseDown={(e) => e.preventDefault()}>
      {name}
    </Button>
  );

  return (
    <ButtonGroup style={{marginBottom: 8}}>
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
      {button(CommonSliceType.kbd, 'Key')}
      {button(CommonSliceType.hidden, 'Spoiler')}
      {button(CommonSliceType.bookmark, 'Bookmark')}
      {button2('Blue', () => {
        ctx.dom.et.format(CommonSliceType.col, 'one', '#07f');
      })}
      {button2('Erase', () => {
        ctx.dom.et.format({behavior: 'erase'});
      })}
      {button2('Clear', () => {
        ctx.dom.et.format({behavior: 'clear'});
      })}
    </ButtonGroup>
  );
};
