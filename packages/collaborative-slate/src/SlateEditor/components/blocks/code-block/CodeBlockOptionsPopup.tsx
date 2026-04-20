import * as React from 'react';
import {Transforms} from 'slate';
import {ReactEditor, useSlateStatic} from 'slate-react';
import {usePopup} from '@jsonjoy.com/ui/lib/4-card/Popup/context';
import {EditorContextPopup} from '../../chrome/EditorContextPopup';
import type {CodeBlockElement as CodeBlockElementType} from '../../../types';
import {CodeBlockOptions} from './CodeBlockOptions';

export interface CodeBlockOptionsPopupProps {
  element: CodeBlockElementType;
}

export const CodeBlockOptionsPopup: React.FC<CodeBlockOptionsPopupProps> = ({element}) => {
  const editor = useSlateStatic();
  const popup = usePopup();
  const [languageDraft, setLanguageDraft] = React.useState(element.language ?? '');
  const [fileNameDraft, setFileNameDraft] = React.useState(element.fileName ?? '');

  React.useEffect(() => {
    setLanguageDraft(element.language ?? '');
  }, [element.language]);

  React.useEffect(() => {
    setFileNameDraft(element.fileName ?? '');
  }, [element.fileName]);

  const applyMetaValue = React.useCallback(
    (field: 'language' | 'fileName', value: string, currentValue?: string) => {
      const nextValue = value.trim();
      const prevValue = currentValue?.trim() ?? '';
      if (nextValue === prevValue) return;

      const path = ReactEditor.findPath(editor, element);
      if (nextValue) {
        Transforms.setNodes(editor, {[field]: nextValue} as Partial<CodeBlockElementType>, {at: path});
      } else {
        Transforms.unsetNodes(editor, field, {at: path});
      }
    },
    [editor, element],
  );

  const resetDrafts = React.useCallback(() => {
    setLanguageDraft(element.language ?? '');
    setFileNameDraft(element.fileName ?? '');
  }, [element.fileName, element.language]);

  const closePopup = React.useCallback(() => {
    resetDrafts();
    popup?.close();
  }, [popup, resetDrafts]);

  const handleApply = React.useCallback(() => {
    const nextLanguage = languageDraft.trim();
    const nextFileName = fileNameDraft.trim();

    applyMetaValue('language', nextLanguage, element.language);
    applyMetaValue('fileName', nextFileName, element.fileName);
    setLanguageDraft(nextLanguage);
    setFileNameDraft(nextFileName);
    popup?.close();
  }, [applyMetaValue, element.fileName, element.language, fileNameDraft, languageDraft, popup]);

  const minWidth = typeof window === 'undefined' ? 320 : Math.max(Math.min(333, window.innerWidth * 0.38), 320);

  return (
    <EditorContextPopup
      title="Code block details"
      subtitle="Set a custom file name and a language for syntax highlighting"
      minWidth={minWidth}
      onCancel={closePopup}
      onApply={handleApply}
    >
      <CodeBlockOptions
        fileName={fileNameDraft}
        language={languageDraft}
        onFileNameChange={setFileNameDraft}
        onLanguageChange={setLanguageDraft}
        onApply={handleApply}
        onCancel={closePopup}
      />
    </EditorContextPopup>
  );
};