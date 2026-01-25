import * as React from 'react';
import {useToolbarPlugin} from '../../context';
import {useSyncStore, useSyncStoreOpt} from '../../../PeritextWebUi/react/hooks';
import {ToolbarMenu} from '@jsonjoy.com/ui/lib/4-card/Toolbar/ToolbarMenu';
import type {PeritextSurfaceState} from '../../../PeritextWebUi/state';

export interface TopToolbarProps {
  ctx: PeritextSurfaceState;
}

export const TopToolbar: React.FC<TopToolbarProps> = ({ctx}) => {
  const {toolbar} = useToolbarPlugin()!;
  const peritext = ctx.peritext;
  const editor = peritext.editor;
  const pending = useSyncStore(editor.pending);
  const isDebugMode = useSyncStoreOpt(toolbar.opts.debug?.enabled);

  if (!ctx.dom) return null;

  const cursor = editor.mainCursor();
  const [complete] = cursor ? peritext.overlay.stat(cursor) : [new Set()];

  // const inlineGroupButton = (type: string | number, name: React.ReactNode) => (
  //   <Button
  //     onClick={() => ctx.dom?.et.format('tog', type)}
  //     onMouseDown={(e) => e.preventDefault()}
  //     active={(complete.has(type) && !pending?.has(type)) || (!complete.has(type) && pending?.has(type))}
  //   >
  //     {name}
  //   </Button>
  // );

  // const button = (name: React.ReactNode, onClick: React.MouseEventHandler, active?: boolean) => (
  //   <Button active={active} onClick={onClick} onMouseDown={(e) => e.preventDefault()}>
  //     {name}
  //   </Button>
  // );

  // const blockGroupButton = (type: string | number, name: React.ReactNode) => (
  //   <Button
  //     onClick={() => ctx.dom?.et.marker({action: 'tog', type})}
  //     onMouseDown={(e) => e.preventDefault()}
  //     active={(complete.has(type) && !pending?.has(type)) || (!complete.has(type) && pending?.has(type))}
  //   >
  //     {name}
  //   </Button>
  // );

  // return (
  //   <ButtonGroup style={{marginBottom: 8}}>
  //     {inlineGroupButton(CommonSliceType.b, 'Bold')}
  //     {inlineGroupButton(CommonSliceType.i, 'Italic')}
  //     {inlineGroupButton(CommonSliceType.u, 'Underline')}
  //     {inlineGroupButton(CommonSliceType.overline, 'Overline')}
  //     {inlineGroupButton(CommonSliceType.s, 'Strikethrough')}
  //     {inlineGroupButton(CommonSliceType.code, 'Code')}
  //     {inlineGroupButton(CommonSliceType.mark, 'Mark')}
  //     {inlineGroupButton(CommonSliceType.del, 'Deleted')}
  //     {inlineGroupButton(CommonSliceType.ins, 'Inserted')}
  //     {inlineGroupButton(CommonSliceType.sup, 'Superscript')}
  //     {inlineGroupButton(CommonSliceType.sub, 'Subscript')}
  //     {inlineGroupButton(CommonSliceType.math, 'Math')}
  //     {inlineGroupButton(CommonSliceType.kbd, 'Key')}
  //     {inlineGroupButton(CommonSliceType.spoiler, 'Spoiler')}
  //     {inlineGroupButton(CommonSliceType.bookmark, 'Bookmark')}
  //     <ButtonSeparator />
  //     {button('Blue', () => {
  //       ctx.dom?.et.format('tog', CommonSliceType.col, 'one', '#07f');
  //     })}
  //     <ButtonSeparator />
  //     {button('Erase', () => {
  //       ctx.dom?.et.format({action: 'erase'});
  //     })}
  //     {button('Clear', () => {
  //       ctx.dom?.et.format({action: 'del'});
  //     })}
  //     {button('Delete block split', () => {
  //       ctx.dom?.et.marker({action: 'del'});
  //     })}
  //     <ButtonSeparator />
  //     {blockGroupButton(CommonSliceType.p, 'Paragraph')}
  //     {blockGroupButton(CommonSliceType.blockquote, 'Blockquote')}
  //     {blockGroupButton(CommonSliceType.codeblock, 'Code Block')}
  //     <ButtonSeparator />
  //     {button('Undo', () => {
  //       ctx.dom?.annals.undo();
  //     })}
  //     {button('Redo', () => {
  //       ctx.dom?.annals.redo();
  //     })}
  //     {!!toolbar.opts.debug && (
  //       <>
  //         <ButtonSeparator />
  //         {button(
  //           'Debug',
  //           () => {
  //             const debug = toolbar.opts.debug!;
  //             debug!.enabled.next(!debug.enabled.value);
  //           },
  //           !!isDebugMode,
  //         )}
  //       </>
  //     )}
  //   </ButtonGroup>
  // );

  return (
    <div>
      <ToolbarMenu menu={toolbar.documentMenu()} pane={false} />
    </div>
  );
};
