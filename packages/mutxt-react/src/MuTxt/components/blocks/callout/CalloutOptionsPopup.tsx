import * as React from 'react';
import {useT} from 'use-t';
import {usePopup} from '@jsonjoy.com/ui/lib/4-card/Popup/context';
import {EditorContextPopup} from '../../../chrome/EditorContextPopup';
import {CalloutOptions} from './CalloutOptions';
import {CalloutOptionsState} from './state';
import {ctx} from './context';
import {useMuTxt} from '../../../context';
import type {CalloutElement as CalloutElementType} from '../../../types';

  export interface CalloutOptionsPopupProps {
  element: CalloutElementType;
}

export const CalloutOptionsPopup: React.FC<CalloutOptionsPopupProps> = ({element}) => {
  const [t] = useT();
  const popup = usePopup();
  const mutxt = useMuTxt();
  const state = React.useMemo(
    () => new CalloutOptionsState(mutxt, element, popup?.close),
    [mutxt, element, popup]);

  return (
    <ctx.Provider value={state}>
      <EditorContextPopup
        title={t('Callout details')}
        subtitle={t('Set the callout icon, title, and accent color')}
        minWidth={300}
        onCancel={state.cancel}
        onApply={state.apply}
      >
        <CalloutOptions />
      </EditorContextPopup>
    </ctx.Provider>
  );
};
