// biome-ignore lint: React is used for JSX
import * as React from 'react';
import {Button} from '../../../components/Button';
import {CommonSliceType} from '../../../../json-crdt-extensions';
import {ButtonGroup} from '../../../components/ButtonGroup';
import {useSyncStore} from '../../../react/hooks';
import {ButtonSeparator} from '../../../components/ButtonSeparator';
import type {PeritextSurfaceState} from '../../../react';

export interface TopToolbarProps {
  ctx: PeritextSurfaceState;
}

export const TopToolbar: React.FC<TopToolbarProps> = ({ctx}) => {
  const peritext = ctx.peritext;
  const editor = peritext.editor;
  const pending = useSyncStore(editor.pending);

  if (!ctx.dom) return null;

  const [complete] = editor.hasCursor() ? peritext.overlay.stat(editor.cursor) : [new Set()];

  const inlineGroupButton = (type: string | number, name: React.ReactNode) => (
    <Button
      onClick={() => ctx.dom?.et.format(type)}
      onMouseDown={(e) => e.preventDefault()}
      active={(complete.has(type) && !pending.has(type)) || (!complete.has(type) && pending.has(type))}
    >
      {name}
    </Button>
  );

  const button = (name: React.ReactNode, onClick: React.MouseEventHandler) => (
    <Button onClick={onClick} onMouseDown={(e) => e.preventDefault()}>
      {name}
    </Button>
  );

  const blockGroupButtom = (type: string | number, name: React.ReactNode) => (
    <Button
      onClick={() => ctx.dom?.et.marker({action: 'tog', type})}
      onMouseDown={(e) => e.preventDefault()}
      active={(complete.has(type) && !pending.has(type)) || (!complete.has(type) && pending.has(type))}
    >
      {name}
    </Button>
  );

  return (
    <ButtonGroup style={{marginBottom: 8}}>
      {inlineGroupButton(CommonSliceType.b, 'Bold')}
      {inlineGroupButton(CommonSliceType.i, 'Italic')}
      {inlineGroupButton(CommonSliceType.u, 'Underline')}
      {inlineGroupButton(CommonSliceType.s, 'Strikethrough')}
      {inlineGroupButton(CommonSliceType.code, 'Code')}
      {inlineGroupButton(CommonSliceType.mark, 'Mark')}
      {inlineGroupButton(CommonSliceType.del, 'Deleted')}
      {inlineGroupButton(CommonSliceType.ins, 'Inserted')}
      {inlineGroupButton(CommonSliceType.sup, 'Superscript')}
      {inlineGroupButton(CommonSliceType.sub, 'Subscript')}
      {inlineGroupButton(CommonSliceType.math, 'Math')}
      {inlineGroupButton(CommonSliceType.kbd, 'Key')}
      {inlineGroupButton(CommonSliceType.hidden, 'Spoiler')}
      {inlineGroupButton(CommonSliceType.bookmark, 'Bookmark')}
      <ButtonSeparator />
      {button('Blue', () => {
        ctx.dom?.et.format(CommonSliceType.col, 'one', '#07f');
      })}
      <ButtonSeparator />
      {button('Erase', () => {
        ctx.dom?.et.format({behavior: 'erase'});
      })}
      {button('Clear', () => {
        ctx.dom?.et.format({behavior: 'clear'});
      })}
      <ButtonSeparator />
      {blockGroupButtom(CommonSliceType.p, 'Paragraph')}
      {blockGroupButtom(CommonSliceType.blockquote, 'Blockquote')}
      {blockGroupButtom(CommonSliceType.codeblock, 'Code Block')}
    </ButtonGroup>
  );
};
