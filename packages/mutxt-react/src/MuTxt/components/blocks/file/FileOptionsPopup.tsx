import * as React from 'react';
import {useSlateStatic} from 'slate-react';
import {usePopup} from '@jsonjoy.com/ui/lib/4-card/Popup/context';
import {BasicButton} from '@jsonjoy.com/ui/lib/2-inline-block/BasicButton';
import {BasicButtonDelete} from '@jsonjoy.com/ui/lib/2-inline-block/BasicButton/BasicButtonDelete';
import {BasicTooltip} from '@jsonjoy.com/ui/lib/4-card/BasicTooltip';
import {Iconista} from '@jsonjoy.com/ui/lib/icons/Iconista';
import {EditorContextPopup} from '../../../chrome/EditorContextPopup';
import {FileOptions} from './FileOptions';
import {FileOptionsStateProvider, useFileOptionsState} from './state';
import {useMuTxt} from '../../../context';
import type {FileElement as FileElementType} from '../../../types';
import {useT} from 'use-t';

const preventMouseDown = (event: React.MouseEvent): void => {
  event.preventDefault();
};

export interface FileOptionsPopupProps {
  element: FileElementType;
}

const FileOptionsPopupBody: React.FC = () => {
  const [t] = useT();
  const state = useFileOptionsState();

  const headerRight = (
    <div style={{display: 'flex', alignItems: 'center', gap: 6}}>
      <BasicTooltip nowrap renderTooltip={() => t('Download')}>
        <BasicButton
          type="button"
          width={32}
          height={32}
          rounder
          onMouseDown={preventMouseDown}
          onClick={state.download}
        >
          <Iconista set={'lucide' as any} icon={'download' as any} width={16} height={16} />
        </BasicButton>
      </BasicTooltip>
      <BasicTooltip nowrap renderTooltip={() => t('Remove file')}>
        <BasicButtonDelete
          type="button"
          width={32}
          height={32}
          rounder
          onMouseDown={preventMouseDown}
          onConfirm={state.remove}
        />
      </BasicTooltip>
    </div>
  );

  return (
    <EditorContextPopup
      title={t('File details')}
      subtitle={t('Rename, caption, or download the file.')}
      headerRight={headerRight}
      minWidth={360}
      onCancel={state.cancel}
      onApply={state.apply}
    >
      <FileOptions />
    </EditorContextPopup>
  );
};

export const FileOptionsPopup: React.FC<FileOptionsPopupProps> = ({element}) => {
  const editor = useSlateStatic();
  const popup = usePopup();
  const mutxt = useMuTxt();

  return (
    <FileOptionsStateProvider
      editor={editor}
      things={mutxt.things}
      element={element}
      closePopup={() => popup?.close()}
    >
      <FileOptionsPopupBody />
    </FileOptionsStateProvider>
  );
};
