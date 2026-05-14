import * as React from 'react';
import {rule} from 'nano-theme';
import {BasicButton} from '@jsonjoy.com/ui/lib/2-inline-block/BasicButton';
import {useStyles} from '@jsonjoy.com/ui/lib/styles/context';
import {Popup} from '@jsonjoy.com/ui/lib/4-card/Popup';
import {EmptyState} from '@jsonjoy.com/ui/lib/4-card/EmptyState';
import {EditorContextPopup} from './EditorContextPopup';
import {ContextMenu} from '@jsonjoy.com/ui/lib/4-card/ContextMenu';
import {useMuTxt} from '../context';
import type {Editor} from 'slate';
import Icon__svg from 'iconista/lib/react/bootstrap/list-columns-reverse';

const Icon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon__svg width={16} height={16} {...props} />;
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
  const mutxt = useMuTxt();
  mutxt.contentVersion.use();
  const outline = mutxt.outline();

  const renderContext = () =>
    outline.length ? (
      <ContextMenu
        inset
        menu={{
          name: 'Table of contents',
          minWidth: Math.min(320, window.innerWidth - 32),
          children: mutxt.docMenu.outlineItems(),
        }}
      />
    ) : (
      <EditorContextPopup
        noMargin
        title={'Document contents'}
        subtitle={
          outline.length
            ? `${outline.length} section${outline.length === 1 ? '' : 's'} from heading structure.`
            : 'Add headings to build a quick outline.'
        }
      >
        <EmptyState frame>
          <div className={emptyStateClass} style={{color: styles.light ? styles.g(0.4) : styles.g(0.6)}}>
            Use Heading 1, Heading 2, or Heading 3 blocks to populate the contents list.
          </div>
        </EmptyState>
      </EditorContextPopup>
    );

  return (
    <Popup renderContext={renderContext} tooltip={{renderTooltip: () => 'Table of contents', nowrap: true}}>
      <BasicButton width={'auto'} height={32} compact rounder aria-label={'Open document table of contents'}>
        <span className={buttonLabelClass}>
          <Icon />
          <span>Go to</span>
        </span>
      </BasicButton>
    </Popup>
  );
};
