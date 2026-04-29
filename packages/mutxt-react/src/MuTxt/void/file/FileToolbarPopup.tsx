import * as React from 'react';
import {rule} from 'nano-theme';
import {Iconista} from '@jsonjoy.com/ui/lib/icons/Iconista';
import {EditorContextPopup} from '../../chrome/EditorContextPopup';
import {useFileButton} from './context';
import {useT} from 'use-t';

const dropZoneClass = rule({
  d: 'flex',
  fld: 'column',
  ai: 'center',
  jc: 'center',
  gap: '12px',
  pd: '24px',
  bd: '2px dashed currentColor',
  bdrad: '8px',
  cur: 'pointer',
});

export const FileToolbarPopup: React.FC = () => {
  const [t] = useT();
  const state = useFileButton();
  const busy = state.busy.use();

  const onDrop = React.useCallback(
    async (event: React.DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      const file = event.dataTransfer.files?.[0];
      if (!file) return;
      await state.insertFromFile(file);
    },
    [state],
  );
  const onDragOver = React.useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  return (
    <EditorContextPopup
      title={t('Insert file')}
      subtitle={t('Pick a file from your device, or drag and drop.')}
      minWidth={360}
      applyLabel={t('Choose file…')}
      applyDisabled={busy}
      onCancel={state.close}
      onApply={() => state.pickAndInsert()}
    >
      <div
        className={dropZoneClass}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onClick={() => state.pickAndInsert()}
      >
        <Iconista set={'lucide' as any} icon={'upload' as any} width={24} height={24} />
        <div style={{fontSize: 13, lineHeight: 1.4, textAlign: 'center'}}>
          {busy ? t('Reading…') : t('Drop a file here, or click to pick')}
        </div>
      </div>
    </EditorContextPopup>
  );
};
