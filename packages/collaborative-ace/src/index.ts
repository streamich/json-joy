import {StrBinding} from '@jsonjoy.com/collaborative-str';
import {AceEditorFacade} from './AceEditorFacade';
import type {Ace} from 'ace-builds';
import type {CollaborativeStr} from '@jsonjoy.com/collaborative-str';

export const bind = (str: () => CollaborativeStr, editor: Ace.Editor, polling?: boolean): (() => void) =>
  StrBinding.bind(str, new AceEditorFacade(editor), polling);
