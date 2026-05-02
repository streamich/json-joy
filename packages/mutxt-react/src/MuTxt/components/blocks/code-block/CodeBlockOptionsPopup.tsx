import * as React from 'react';
import {useSlateStatic} from 'slate-react';
import {usePopup} from '@jsonjoy.com/ui/lib/4-card/Popup/context';
import {EditorContextPopup} from '../../../chrome/EditorContextPopup';
import type {CodeBlockElement as CodeBlockElementType} from '../../../types';
import {CodeBlockOptions} from './CodeBlockOptions';
import {CodeBlockOptionsStateProvider, useCodeBlockOptionsState} from './state';

export interface CodeBlockOptionsPopupProps {
  element: CodeBlockElementType;
}

const CodeBlockOptionsPopupBody: React.FC = () => {
  const state = useCodeBlockOptionsState();

  return (
    <EditorContextPopup
      title="Code block details"
      subtitle="Set code block metadata and display options"
      minWidth={300}
      // noMargin
      onCancel={state.cancel}
      onApply={state.apply}
    >
      <CodeBlockOptions />
    </EditorContextPopup>
  );
};

export const CodeBlockOptionsPopup: React.FC<CodeBlockOptionsPopupProps> = ({element}) => {
  const editor = useSlateStatic();
  const popup = usePopup();

  return (
    <CodeBlockOptionsStateProvider editor={editor} element={element} closePopup={() => popup?.close()}>
      <CodeBlockOptionsPopupBody />
    </CodeBlockOptionsStateProvider>
  );
};
