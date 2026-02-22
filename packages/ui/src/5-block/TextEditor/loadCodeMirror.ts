import {EditorView, basicSetup} from 'codemirror';
import {markdown} from '@codemirror/lang-markdown';
import {EditorState, type Extension} from '@codemirror/state';
import {placeholder as placeholderExtension} from '@codemirror/view';

export interface CreateEditorOptions {
  parent: HTMLElement;
  placeholder?: string;
  onFocus?: () => void;
  onBlur?: () => void;
  onChange?: () => void;
}

export const createEditor = (options: CreateEditorOptions): EditorView => {
  const {parent, placeholder, onFocus, onBlur, onChange} = options;

  const extensions: Extension[] = [
    basicSetup,
    markdown(),
    EditorView.lineWrapping,
    EditorView.theme({
      '&': {
        backgroundColor: 'transparent',
      },
      '.cm-gutters': {
        backgroundColor: 'transparent',
        border: 'none',
      },
      '.cm-content': {
        caretColor: 'inherit',
      },
      '&.cm-focused .cm-selectionBackground, ::selection': {
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
      },
      '.cm-selectionBackground': {
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
      },
    }),
  ];

  if (placeholder) {
    extensions.push(placeholderExtension(placeholder));
  }

  if (onFocus || onBlur) {
    extensions.push(
      EditorView.domEventHandlers({
        focus: onFocus
          ? () => {
              onFocus();
              return false;
            }
          : undefined,
        blur: onBlur
          ? () => {
              onBlur();
              return false;
            }
          : undefined,
      }),
    );
  }

  if (onChange) {
    extensions.push(
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          onChange();
        }
      }),
    );
  }

  const state = EditorState.create({
    extensions,
  });

  const view = new EditorView({
    state,
    parent,
  });

  return view;
};
