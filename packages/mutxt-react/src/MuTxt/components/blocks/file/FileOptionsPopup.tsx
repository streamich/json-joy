import * as React from 'react';
import {useT} from 'use-t';
import {usePopup} from '@jsonjoy.com/ui/lib/4-card/Popup/context';
import {BasicButton} from '@jsonjoy.com/ui/lib/2-inline-block/BasicButton';
import {BasicButtonDelete} from '@jsonjoy.com/ui/lib/2-inline-block/BasicButton/BasicButtonDelete';
import {BasicTooltip} from '@jsonjoy.com/ui/lib/4-card/BasicTooltip';
import {Iconista} from '@jsonjoy.com/ui/lib/icons/Iconista';
import {EditorContextPopup} from '../../../chrome/EditorContextPopup';
import {FileOptions} from './FileOptions';
import {FileOptionsState} from './state';
import {ctx} from './context';
import {useMuTxt} from '../../../context';
import type {FileElement as FileElementType} from '../../../types';

const preventMouseDown = (event: React.MouseEvent): void => {
  event.preventDefault();
};

const stopBubble = (event: React.SyntheticEvent): void => {
  event.stopPropagation();
};

export interface FileOptionsPopupProps {
  element: FileElementType;
}

export const FileOptionsPopup: React.FC<FileOptionsPopupProps> = ({element}) => {
  const [t] = useT();
  const popup = usePopup();
  const mutxt = useMuTxt();
  const state = React.useMemo(() => new FileOptionsState(mutxt, element, popup?.close), [mutxt, element, popup]);

  const headerRight = (
    // biome-ignore lint/a11y/useKeyWithClickEvents: click handler only stops bubbling; keyboard interaction is on inner buttons
    <div style={{display: 'flex', alignItems: 'center', gap: 6}} onMouseDown={stopBubble} onClick={stopBubble}>
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
    <ctx.Provider value={state}>
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
    </ctx.Provider>
  );
};
