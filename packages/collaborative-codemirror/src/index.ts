import {StrBinding, type CollaborativeStr} from '@jsonjoy.com/collaborative-str';
import {CodemirrorEditorFacade} from './CodemirrorEditorFacade';
import type {EditorView} from 'codemirror';

export const bind = (str: () => CollaborativeStr, editor: EditorView, polling?: boolean): (() => void) => {
  const facade = new CodemirrorEditorFacade(editor);
  return StrBinding.bind(str, facade, polling);
};
