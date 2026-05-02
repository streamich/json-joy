import * as React from 'react';
import {rule} from 'nano-theme';
import {BasicButton} from '@jsonjoy.com/ui/lib/2-inline-block/BasicButton';
import {BasicButtonDelete} from '@jsonjoy.com/ui/lib/2-inline-block/BasicButton/BasicButtonDelete';
import {CopyButton} from '@jsonjoy.com/ui/lib/2-inline-block/CopyButton';
import {Input} from '@jsonjoy.com/ui/lib/2-inline-block/Input';
import {BasicTooltip} from '@jsonjoy.com/ui/lib/4-card/BasicTooltip';
import {Iconista} from '@jsonjoy.com/ui/lib/icons/Iconista';
import {EditorContextPopup} from '../../chrome/EditorContextPopup';
import {EmbedPreview} from '../../components/blocks/EmbedElement';
import {useEmbedButton} from './context';

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

const preventMouseDown = (event: React.MouseEvent): void => {
  event.preventDefault();
};

const stopMouseDownPropagation = (event: React.MouseEvent): void => {
  event.stopPropagation();
};

export const EmbedToolbarPopup: React.FC = () => {
  const state = useEmbedButton();
  const open = state.open.use();
  const draftUrl = state.draftUrl.use();
  const draftCaption = state.draftCaption.use();
  const editingPath = state.editingPath.use();
  const normalizedDraft = state.normalizedDraft.use();
  const [previewUrl, setPreviewUrl] = React.useState('');

  React.useEffect(() => {
    if (!open || !normalizedDraft) {
      setPreviewUrl('');
      return;
    }
    const timer = window.setTimeout(() => setPreviewUrl(normalizedDraft), 250);
    return () => window.clearTimeout(timer);
  }, [normalizedDraft, open]);

  const title = editingPath ? 'Edit embed' : 'Add embed';
  const subtitle = editingPath
    ? 'Update the embed link or caption.'
    : 'Paste a link to a video, audio, tweet, or anything else.';

  const actionRow = !!normalizedDraft && (
    <div className={actionRowClass} onMouseDown={stopMouseDownPropagation}>
      <div className={actionButtonsClass}>
        <CopyButton
          type="button"
          width={32}
          height={32}
          rounder
          onMouseDown={preventMouseDown}
          onCopy={() => normalizedDraft}
          tooltip={{nowrap: true, renderTooltip: () => 'Copy URL'}}
        />
        <BasicTooltip nowrap renderTooltip={() => 'Open source'}>
          <BasicButton type="button" width={32} height={32} rounder onMouseDown={preventMouseDown} to={normalizedDraft}>
            <Iconista set={'lucide' as any} icon={'external-link' as any} width={16} height={16} />
          </BasicButton>
        </BasicTooltip>
        {!!editingPath && (
          <BasicTooltip nowrap renderTooltip={() => 'Remove embed'}>
            <BasicButtonDelete
              type="button"
              width={32}
              height={32}
              rounder
              onMouseDown={preventMouseDown}
              onConfirm={state.remove}
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
    <EditorContextPopup
      title={title}
      subtitle={subtitle}
      headerRight={actionRow || undefined}
      minWidth={Math.max(Math.min(500, window.innerWidth * 0.55), 360)}
      applyLabel={editingPath ? 'Update' : 'Insert'}
      applyDisabled={!normalizedDraft}
      onCancel={state.close}
      onApply={state.apply}
    >
      <div className={inputRowClass}>
        <Input
          type="text"
          label="Embed URL"
          value={draftUrl}
          placeholder="https://www.youtube.com/watch?v=..."
          focus
          select={open}
          onChange={state.setDraftUrl}
          onEnter={(event) => {
            event.preventDefault();
            state.apply();
          }}
          onEsc={(event) => {
            event.preventDefault();
            state.close();
          }}
        />
        <Input
          type="text"
          label="Caption"
          value={draftCaption}
          placeholder="Optional caption"
          onChange={state.setDraftCaption}
          onEnter={(event) => {
            event.preventDefault();
            state.apply();
          }}
          onEsc={(event) => {
            event.preventDefault();
            state.close();
          }}
        />
        {preview}
      </div>
    </EditorContextPopup>
  );
};
