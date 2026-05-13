import * as React from 'react';
import {useSlateStatic} from 'slate-react';
import {usePopup} from '@jsonjoy.com/ui/lib/4-card/Popup/context';
import {EditorContextPopup} from '../../../chrome/EditorContextPopup';
import {useMuTxt} from '../../../context';
import {MathOptions} from './MathOptions';
import {MathOptionsStateProvider, useMathOptionsState} from './state';
import {useT} from 'use-t';
import type {MathElement as MathElementType} from '../../../types';

export interface MathOptionsPopupProps {
  element: MathElementType;
  closePopup?: () => void;
}

const MathOptionsPopupBody: React.FC = () => {
  const [t] = useT();
  const state = useMathOptionsState();

  return (
    <EditorContextPopup
      title={t('Equation options')}
      subtitle={t('Set how the equation is displayed and referenced.')}
      minWidth={360}
      onCancel={state.cancel}
      onApply={state.apply}
    >
      <MathOptions />
    </EditorContextPopup>
  );
};

export const MathOptionsPopup: React.FC<MathOptionsPopupProps> = ({element, closePopup}) => {
  const editor = useSlateStatic();
  const mutxt = useMuTxt();
  const popup = usePopup();
  mutxt.things.version.use();
  const onClose = React.useCallback(() => {
    if (closePopup) closePopup();
    else popup?.close();
  }, [closePopup, popup]);

  return (
    <MathOptionsStateProvider editor={editor} mutxt={mutxt} element={element} closePopup={onClose}>
      <MathOptionsPopupBody />
    </MathOptionsStateProvider>
  );
};
