import * as React from 'react';
import {rule} from 'nano-theme';
import {Element as SlateElement, Node as SlateNode, type Editor} from 'slate';
import {ReactEditor} from 'slate-react';
import {BasicButton} from '@jsonjoy.com/ui/lib/2-inline-block/BasicButton';
import {Iconista, makeIcon} from '@jsonjoy.com/ui/lib/icons/Iconista';
import {useStyles} from '@jsonjoy.com/ui/lib/styles/context';
import {getDocumentOutline} from '../behavior/outline';
import {Popup} from '@jsonjoy.com/ui/lib/4-card/Popup';
import {EmptyState} from '@jsonjoy.com/ui/lib/4-card/EmptyState';
import {EditorContextPopup} from './EditorContextPopup';
import {ContextMenu} from '@jsonjoy.com/ui/lib/4-card/ContextMenu';
import type {SlateEditorDocument} from '../types';

const Icon = makeIcon({set: 'bootstrap', icon: 'list-columns-reverse', width: 16, height: 16});
// const Icon = makeIcon({set: 'bootstrap', icon: 'card-heading', width: 16, height: 16});

const buttonLabelClass = rule({
  d: 'inline-flex',
  ai: 'center',
  gap: '8px',
});

const emptyStateClass = rule({
  pd: '10px 12px 14px',
  fz: '12px',
  lh: '1.55',
});

export interface DocumentOutlineButtonProps {
  editor: Editor;
  contentWidth?: number;
}

export const DocumentOutlineButton: React.FC<DocumentOutlineButtonProps> = ({editor, contentWidth}) => {
  const styles = useStyles();
  const outline = getDocumentOutline(editor.children as SlateEditorDocument);

  const handleScrollTo = React.useCallback(
    (path: number[]) => {
      try {
        const node = SlateNode.get(editor, path);
        if (!SlateElement.isElement(node)) return;
        const domNode = ReactEditor.toDOMNode(editor as ReactEditor, node) as HTMLElement;
        domNode.scrollIntoView({behavior: 'smooth', block: 'start'});
      } catch {}
    },
    [editor],
  );

  const renderContext = () => outline.length ? (
    <ContextMenu inset menu={{
      name: 'Table of contents',
      minWidth: Math.min(320, window.innerWidth - 32),
      children: outline.map((item) => ({
        key: item.key,
        name: item.title,
        display: () => <div style={{paddingLeft: (item.level - 1) * 16, fontWeight: 400 + (3 - item.level) * 100, fontSize: item.level ? void 0 : '1.1em'}}>{item.title}</div>,
        // right: () => <span style={{fontSize: 10, opacity: 0.5}}>{item.path.join('.')}</span>,
        icon: () => item.level
          ? <Iconista set="tabler" icon={`h-${item.level}`} width={16} height={16} style={{opacity: .5}} />
          : <Iconista set="lucide" icon="type" width={16} height={16} style={{opacity: .5}} />,
        onSelect: () => handleScrollTo(item.path),
      })),
    }} />) : (
      <EditorContextPopup noMargin title={'Document contents'} subtitle={outline.length ? `${outline.length} section${outline.length === 1 ? '' : 's'} from heading structure.` : 'Add headings to build a quick outline.'}>
        <EmptyState frame>
          <div className={emptyStateClass} style={{color: styles.light ? styles.g(0.4) : styles.g(0.6)}}>
            Use Heading 1, Heading 2, or Heading 3 blocks to populate the contents list.
          </div>
        </EmptyState>
      </EditorContextPopup>
    );

  return (
    <Popup renderContext={renderContext} tooltip={{renderTooltip: () => 'Table of contents', nowrap: true}}>
      <BasicButton
        width={'auto'}
        height={32}
        compact
        rounder
        aria-label={'Open document table of contents'}
      >
        <span className={buttonLabelClass}>
          <Icon />
          <span>Go to</span>
        </span>
      </BasicButton>
    </Popup>
  );
};