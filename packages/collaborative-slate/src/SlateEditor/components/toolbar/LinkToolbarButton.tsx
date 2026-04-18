import * as React from 'react';
import {flushSync} from 'react-dom';
import {rule} from 'nano-theme';
import {BasicButton} from '@jsonjoy.com/ui/lib/2-inline-block/BasicButton';
import {CopyButton} from '@jsonjoy.com/ui/lib/2-inline-block/CopyButton';
import {ContextPane} from '@jsonjoy.com/ui/lib/4-card/ContextMenu';
import {PopupControlled} from '@jsonjoy.com/ui/lib/4-card/Popup/PopupControlled';
import {ToolbarItem} from '@jsonjoy.com/ui/lib/4-card/Toolbar/ToolbarItem';
import {Input} from '@jsonjoy.com/ui/lib/2-inline-block/Input';
import {BasicTooltip} from '@jsonjoy.com/ui/lib/4-card/BasicTooltip';
import {Iconista} from '@jsonjoy.com/ui/lib/icons/Iconista';
import {useStyles} from '@jsonjoy.com/ui/lib/styles/context';
import {anchorContext, useAnchorPointHandle} from '@jsonjoy.com/ui/lib/utils/popup/context';
import type {Editor} from 'slate';
import {getActiveLink, hasRangeSelection, normalizeLinkHref, removeLink, upsertLink} from '../../behavior/link';
import {useSlateEditorState} from '../../context';

const popupAnchor = {center: true, gap: 12, topIf: 180};

const popupBodyClass = rule({
  d: 'flex',
  fld: 'column',
  gap: '10px',
  pd: '12px',
});

const titleClass = rule({
  fz: '12px',
  lh: '1.45',
});

const inputRowClass = rule({
  d: 'grid',
  gridTemplateColumns: '1fr auto',
  gap: '8px',
  ai: 'center',
});

const linkMetaClass = rule({
  fz: '12px',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

const actionRowClass = rule({
  d: 'flex',
  ai: 'center',
  jc: 'space-between',
  gap: '8px',
});

const actionButtonsClass = rule({
  d: 'flex',
  ai: 'center',
  gap: '6px',
});

export interface LinkToolbarButtonProps {
  editor: Editor;
  readOnly?: boolean;
  onVisualChange: () => void;
}

export const LinkToolbarButton: React.FC<LinkToolbarButtonProps> = ({editor, readOnly, onVisualChange}) => {
  const styles = useStyles();
  const state = useSlateEditorState();
  const handle = useAnchorPointHandle(popupAnchor);
  const activeLink = getActiveLink(editor);
  const hasSelection = hasRangeSelection(editor);
  const canOpen = !readOnly && (hasSelection || !!activeLink);
  const linkMenuRequest = state.linkMenuRequest.use();
  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState('');
  const handledRequestRef = React.useRef(linkMenuRequest);

  React.useEffect(() => {
    if (open && !canOpen) setOpen(false);
  }, [canOpen, open]);

  React.useEffect(() => {
    if (linkMenuRequest === handledRequestRef.current) return;
    handledRequestRef.current = linkMenuRequest;
    if (!canOpen) return;
    setDraft(activeLink?.href ?? '');
    setOpen(true);
  }, [activeLink?.href, canOpen, linkMenuRequest]);

  const preventMouseDown = React.useCallback((event: React.MouseEvent) => {
    event.preventDefault();
  }, []);

  const handleToggle = React.useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      if (!canOpen) return;
      setOpen((value) => {
        const next = !value;
        if (next) setDraft(activeLink?.href ?? '');
        return next;
      });
    },
    [activeLink?.href, canOpen],
  );

  const handleApply = React.useCallback(() => {
    const prevDraft = draft;
    flushSync(() => setOpen(false));
    const link = upsertLink(editor, draft);
    if (!link) {
      setDraft(prevDraft);
      return;
    }
    setDraft(link.href);
    onVisualChange();
  }, [draft, editor, onVisualChange]);

  const handleRemove = React.useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      if (!removeLink(editor)) return;
      setOpen(false);
      onVisualChange();
    },
    [editor, onVisualChange],
  );

  const handleGoto = React.useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      const href = activeLink?.href ?? normalizeLinkHref(draft);
      if (!href) return;
      window.open(href, '_blank', 'noopener,noreferrer');
      setOpen(false);
    },
    [activeLink?.href, draft],
  );

  const popupTitle = activeLink ? 'Edit link' : 'Add link';
  const normalizedDraft = normalizeLinkHref(draft);

  const actionRow = !!activeLink && (
    <div className={actionRowClass}>
      <div className={linkMetaClass} style={{color: styles.light ? styles.g(0.34) : styles.g(0.64)}} title={activeLink.href}>
        {activeLink.href}
      </div>
      <div className={actionButtonsClass}>
        <CopyButton
          type="button"
          width={32}
          height={32}
          border
          rounder
          onMouseDown={preventMouseDown}
          onCopy={() => activeLink.href}
          tooltip={{nowrap: true, renderTooltip: () => 'Copy link'}}
        />
        <BasicTooltip nowrap renderTooltip={() => 'Open link'}>
          <BasicButton
            type="button"
            width={32}
            height={32}
            border
            rounder
            onMouseDown={preventMouseDown}
            onClick={handleGoto}
          >
            <Iconista set={'lucide' as any} icon={'external-link' as any} width={16} height={16} />
          </BasicButton>
        </BasicTooltip>
        <BasicTooltip nowrap renderTooltip={() => 'Remove link'}>
          <BasicButton
            type="button"
            width={32}
            height={32}
            border
            rounder
            onMouseDown={preventMouseDown}
            onClick={handleRemove}
          >
            <Iconista set={'lucide' as any} icon={'trash' as any} width={16} height={16} />
          </BasicButton>
        </BasicTooltip>
      </div>
    </div>
  );

  return (
    <anchorContext.Provider value={handle}>
      <PopupControlled
        refToggle={handle.ref}
        open={open}
        onEsc={() => setOpen(false)}
        onClickAway={() => setOpen(false)}
        onHeadClick={handleToggle}
        renderContext={() => (
          <ContextPane minWidth={Math.max(Math.min(560, window.innerWidth * 0.4), 320)}>
            <div className={popupBodyClass}>
              <div className={titleClass} style={{color: styles.light ? styles.g(0.34) : styles.g(0.7)}}>
                <strong style={{display: 'block', marginBottom: 4, color: styles.light ? styles.g(0.12) : styles.g(0.94)}}>
                  {popupTitle}
                </strong>
                {activeLink ? 'Update the current link target, copy it, open it, or remove it.' : 'Enter a URL to wrap the current selection.'}
              </div>

              <div className={inputRowClass}>
                <Input
                  type="text"
                  value={draft}
                  placeholder="https://example.com"
                  focus={open}
                  select={open}
                  onChange={setDraft}
                  onEnter={(event) => {
                    event.preventDefault();
                    handleApply();
                  }}
                  onEsc={(event) => {
                    event.preventDefault();
                    setOpen(false);
                  }}
                />
                <BasicButton
                  type="button"
                  width={'auto'}
                  height={32}
                  compact
                  border
                  disabled={!normalizedDraft}
                  onMouseDown={preventMouseDown}
                  onClick={(event) => {
                    event.preventDefault();
                    handleApply();
                  }}
                >
                  Apply
                </BasicButton>
              </div>

              {actionRow}
            </div>
          </ContextPane>
        )}
      >
        <ToolbarItem
          type="button"
          selected={!readOnly && (open || hasSelection || !!activeLink)}
          disabled={!canOpen}
          onMouseDown={preventMouseDown}
          tooltip={{nowrap: true, renderTooltip: () => popupTitle, shortcut: 'Cmd+K'}}
        >
          <Iconista set={'lucide' as any} icon={'link' as any} width={16} height={16} />
        </ToolbarItem>
      </PopupControlled>
    </anchorContext.Provider>
  );
};