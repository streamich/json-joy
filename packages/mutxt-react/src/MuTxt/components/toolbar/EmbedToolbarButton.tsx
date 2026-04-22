import * as React from 'react';
import {flushSync} from 'react-dom';
import {rule} from 'nano-theme';
import {BasicButton} from '@jsonjoy.com/ui/lib/2-inline-block/BasicButton';
import {BasicButtonDelete} from '@jsonjoy.com/ui/lib/2-inline-block/BasicButton/BasicButtonDelete';
import {CopyButton} from '@jsonjoy.com/ui/lib/2-inline-block/CopyButton';
import {Input} from '@jsonjoy.com/ui/lib/2-inline-block/Input';
import {BasicTooltip} from '@jsonjoy.com/ui/lib/4-card/BasicTooltip';
import {PopupControlled} from '@jsonjoy.com/ui/lib/4-card/Popup/PopupControlled';
import {ToolbarItem} from '@jsonjoy.com/ui/lib/4-card/Toolbar/ToolbarItem';
import {Iconista} from '@jsonjoy.com/ui/lib/icons/Iconista';
import {anchorContext, useAnchorPointHandle} from '@jsonjoy.com/ui/lib/utils/popup/context';
import {getActiveEmbedEntry, insertEmbed, normalizeEmbedUrl, removeEmbedAtPath, updateEmbedAtPath} from '../../behavior/embed';
import {EmbedPreview} from '../blocks/EmbedElement';
import {EditorContextPopup} from '../chrome/EditorContextPopup';
import type {Path, Editor} from 'slate';

const popupAnchor = {center: true, gap: 12, topIf: 180};

const inputRowClass = rule({
  d: 'flex',
  fld: 'column',
  gap: '10px',
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

const previewHintClass = rule({
  fz: '12px',
  lh: '1.45',
});

export interface EmbedToolbarButtonProps {
  editor: Editor;
  readOnly?: boolean;
  onVisualChange: () => void;
}

export const EmbedToolbarButton: React.FC<EmbedToolbarButtonProps> = ({editor, readOnly, onVisualChange}) => {
  const handle = useAnchorPointHandle(popupAnchor);
  const activeEmbedEntry = getActiveEmbedEntry(editor);
  const activeEmbed = activeEmbedEntry?.[0] ?? null;
  const canOpen = !readOnly;
  const [open, setOpen] = React.useState(false);
  const [editingPath, setEditingPath] = React.useState<Path | null>(null);
  const [draftUrl, setDraftUrl] = React.useState('');
  const [draftCaption, setDraftCaption] = React.useState('');
  const [previewUrl, setPreviewUrl] = React.useState('');

  const normalizedDraft = normalizeEmbedUrl(draftUrl);

  React.useEffect(() => {
    if (open && !canOpen) {
      setOpen(false);
      setEditingPath(null);
    }
  }, [canOpen, open]);

  React.useEffect(() => {
    if (!open || !normalizedDraft) {
      setPreviewUrl('');
      return;
    }
    const timer = window.setTimeout(() => setPreviewUrl(normalizedDraft), 250);
    return () => window.clearTimeout(timer);
  }, [normalizedDraft, open]);

  const syncDraftFromSelection = React.useCallback(() => {
    const entry = getActiveEmbedEntry(editor);
    setEditingPath(entry?.[1] ?? null);
    setDraftUrl(entry?.[0].url ?? '');
    setDraftCaption(entry?.[0].caption ?? '');
  }, [editor]);

  const preventMouseDown = React.useCallback((event: React.MouseEvent) => {
    event.preventDefault();
  }, []);

  const handleClose = React.useCallback(() => {
    setOpen(false);
    setEditingPath(null);
  }, []);

  const handleToggle = React.useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      if (!canOpen) return;
      setOpen((value) => {
        const next = !value;
        if (next) syncDraftFromSelection();
        else setEditingPath(null);
        return next;
      });
    },
    [canOpen, syncDraftFromSelection],
  );

  const handleApply = React.useCallback(() => {
    if (!normalizedDraft) return;
    const nextCaption = draftCaption.trim();
    flushSync(() => setOpen(false));
    const updated = editingPath
      ? updateEmbedAtPath(editor, editingPath, normalizedDraft, nextCaption)
      : !!insertEmbed(editor, normalizedDraft, nextCaption);
    if (!updated) {
      setOpen(true);
      return;
    }
    setDraftUrl(normalizedDraft);
    setDraftCaption(nextCaption);
    setEditingPath(null);
    onVisualChange();
  }, [draftCaption, editingPath, editor, normalizedDraft, onVisualChange]);

  const handleRemove = React.useCallback(() => {
    if (!editingPath) return;
    if (!removeEmbedAtPath(editor, editingPath)) return;
    handleClose();
    onVisualChange();
  }, [editingPath, editor, handleClose, onVisualChange]);

  const popupTitle = editingPath ? 'Edit embed' : 'Add embed';
  const popupSubtitle = editingPath
    ? 'Update the embed link or caption.'
    : 'Paste a link to a video, audio, tweet, or anything else.';

  const actionRow = !!normalizedDraft && (
    <div className={actionRowClass}>
      <div className={actionButtonsClass}>
        <CopyButton
          type='button'
          width={32}
          height={32}
          rounder
          onMouseDown={preventMouseDown}
          onCopy={() => normalizedDraft}
          tooltip={{nowrap: true, renderTooltip: () => 'Copy URL'}}
        />
        <BasicTooltip nowrap renderTooltip={() => 'Open source'}>
          <BasicButton
            type='button'
            width={32}
            height={32}
            rounder
            onMouseDown={preventMouseDown}
            to={normalizedDraft}
          >
            <Iconista set={'lucide' as any} icon={'external-link' as any} width={16} height={16} />
          </BasicButton>
        </BasicTooltip>
        {!!editingPath && (
          <BasicTooltip nowrap renderTooltip={() => 'Remove embed'}>
            <BasicButtonDelete
              type='button'
              width={32}
              height={32}
              rounder
              onMouseDown={preventMouseDown}
              onConfirm={handleRemove}
            />
          </BasicTooltip>
        )}
      </div>
    </div>
  );

  const preview = previewUrl ? (
    <EmbedPreview url={previewUrl} caption={draftCaption.trim() || undefined} compact width={400} />
  ) : null;

  return (
    <anchorContext.Provider value={handle}>
      <PopupControlled
        refToggle={handle.ref}
        open={open}
        onEsc={handleClose}
        onClickAway={handleClose}
        onHeadClick={handleToggle}
        renderContext={() => (
          <EditorContextPopup
            title={popupTitle}
            subtitle={popupSubtitle}
            headerRight={actionRow}
            minWidth={Math.max(Math.min(500, window.innerWidth * 0.55), 360)}
            applyLabel={editingPath ? 'Update' : 'Insert'}
            applyDisabled={!normalizedDraft}
            onCancel={handleClose}
            onApply={handleApply}
          >
            <div className={inputRowClass}>
              <Input
                type='text'
                label='Embed URL'
                value={draftUrl}
                placeholder='https://www.youtube.com/watch?v=...'
                focus
                select={open}
                onChange={setDraftUrl}
                onEnter={(event) => {
                  event.preventDefault();
                  handleApply();
                }}
                onEsc={(event) => {
                  event.preventDefault();
                  handleClose();
                }}
              />
              <Input
                type='text'
                label='Caption'
                value={draftCaption}
                placeholder='Optional caption'
                onChange={setDraftCaption}
                onEnter={(event) => {
                  event.preventDefault();
                  handleApply();
                }}
                onEsc={(event) => {
                  event.preventDefault();
                  handleClose();
                }}
              />
              {preview}
            </div>
          </EditorContextPopup>
        )}
      >
        <ToolbarItem
          type='button'
          selected={!readOnly && (open || !!activeEmbed)}
          disabled={!canOpen}
          onMouseDown={preventMouseDown}
          tooltip={{nowrap: true, renderTooltip: () => popupTitle}}
        >
          <Iconista set={'lucide' as any} icon={'link-2' as any} width={16} height={16} />
        </ToolbarItem>
      </PopupControlled>
    </anchorContext.Provider>
  );
};