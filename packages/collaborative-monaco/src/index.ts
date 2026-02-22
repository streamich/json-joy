import {StrBinding, type CollaborativeStr} from '@jsonjoy.com/collaborative-str';
import {MonacoEditorFacade} from './MonacoEditorFacade';
import type * as monaco from 'monaco-editor';

export {MonacoEditorFacade} from './MonacoEditorFacade';

export const bind = (
  str: () => CollaborativeStr,
  editor: monaco.editor.IStandaloneCodeEditor,
  polling?: boolean,
): (() => void) => {
  const facade = new MonacoEditorFacade(editor);
  return StrBinding.bind(str, facade, polling);
};
