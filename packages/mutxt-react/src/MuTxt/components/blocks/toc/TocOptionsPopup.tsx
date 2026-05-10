import * as React from 'react';
import {useSlateStatic} from 'slate-react';
import {usePopup} from '@jsonjoy.com/ui/lib/4-card/Popup/context';
import {EditorContextPopup} from '../../../chrome/EditorContextPopup';
import {TocOptions} from './TocOptions';
import {TocOptionsStateProvider, useTocOptionsState} from './state';
import {useT} from 'use-t';
import type {TocElement as TocElementType} from '../../../types';

export interface TocOptionsPopupProps {
  element: TocElementType;
  closePopup?: () => void;
}

const TocOptionsPopupBody: React.FC = () => {
  const [t] = useT();
  const state = useTocOptionsState();

  return (
    <EditorContextPopup
      title={t('Table of contents')}
      subtitle={t('Configure how the document outline is rendered.')}
      minWidth={320}
      onCancel={state.cancel}
      onApply={state.apply}
    >
      <TocOptions />
    </EditorContextPopup>
  );
};

export const TocOptionsPopup: React.FC<TocOptionsPopupProps> = ({element, closePopup}) => {
  const editor = useSlateStatic();
  const popup = usePopup();
  const onClose = React.useCallback(() => {
    if (closePopup) closePopup();
    else popup?.close();
  }, [closePopup, popup]);

  return (
    <TocOptionsStateProvider editor={editor} element={element} closePopup={onClose}>
      <TocOptionsPopupBody />
    </TocOptionsStateProvider>
  );
};
