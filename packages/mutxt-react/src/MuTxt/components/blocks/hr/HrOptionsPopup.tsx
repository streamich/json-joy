import * as React from 'react';
import {useSlateStatic} from 'slate-react';
import {usePopup} from '@jsonjoy.com/ui/lib/4-card/Popup/context';
import {EditorContextPopup} from '../../../chrome/EditorContextPopup';
import {HrOptions} from './HrOptions';
import {HrOptionsStateProvider, useHrOptionsState} from './state';
import type {HrElement as HrElementType} from '../../../types';
import {useT} from 'use-t';

export interface HrOptionsPopupProps {
  element: HrElementType;
}

const HrOptionsPopupBody: React.FC = () => {
  const [t] = useT();
  const state = useHrOptionsState();

  return (
    <EditorContextPopup
      title={t('Separator details')}
      subtitle={t('Configure the line style, width, height, and optional text.')}
      minWidth={320}
      onCancel={state.cancel}
      onApply={state.apply}
    >
      <HrOptions />
    </EditorContextPopup>
  );
};

export const HrOptionsPopup: React.FC<HrOptionsPopupProps> = ({element}) => {
  const editor = useSlateStatic();
  const popup = usePopup();

  return (
    <HrOptionsStateProvider editor={editor} element={element} closePopup={() => popup?.close()}>
      <HrOptionsPopupBody />
    </HrOptionsStateProvider>
  );
};
