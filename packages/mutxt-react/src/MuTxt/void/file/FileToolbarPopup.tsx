import * as React from 'react';
import {Iconista} from '@jsonjoy.com/ui/lib/icons/Iconista';
import {DropArea, DropAreaState} from '@jsonjoy.com/ui/lib/5-block/DropArea';
import {EditorContextPopup} from '../../chrome/EditorContextPopup';
import {useFileButton} from './context';
import {useT} from 'use-t';

export const FileToolbarPopup: React.FC = () => {
  const [t] = useT();
  const state = useFileButton();
  const busy = state.busy.use();
  const dropState = React.useMemo(
    () =>
      new DropAreaState(async (files) => {
        const file = files[0];
        if (!file) return;
        await state.insertFromFile(file);
      }),
    [state],
  );

  return (
    <EditorContextPopup
      title={t('Insert file')}
      subtitle={t('Pick a file from your device, or drag and drop.')}
      minWidth={360}
      applyLabel={t('Choose file…')}
      applyDisabled={busy}
      onCancel={state.close}
      onApply={dropState.pick}
    >
      <DropArea state={dropState} multiple={false} paper={false} compact>
        <Iconista set={'lucide' as any} icon={'upload' as any} width={24} height={24} />
        <div className="DropArea-text" style={{fontSize: 13, lineHeight: 1.4, textAlign: 'center'}}>
          {busy ? t('Reading…') : t('Drop a file here, or click to pick')}
        </div>
      </DropArea>
    </EditorContextPopup>
  );
};
