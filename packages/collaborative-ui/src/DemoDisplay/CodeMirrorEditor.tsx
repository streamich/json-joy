import * as React from 'react';
import {EditorView, basicSetup} from 'codemirror';
import {EditorState} from '@codemirror/state';
import {bind} from 'collaborative-codemirror';
import type {CollaborativeStr} from 'collaborative-editor';

export type Config = ConstructorParameters<typeof EditorView>[0];

export interface CodeMirrorEditorProps extends React.HTMLAttributes<HTMLDivElement> {
  str: () => CollaborativeStr;
  config?: Config;
  onMount?: (editor: EditorView) => void;
}

export const CodeMirrorEditor: React.FC<CodeMirrorEditorProps> = ({str, config, onMount, ...rest}) => {
  const divRef = React.useRef<HTMLDivElement>(null);
  const editorRef = React.useRef<EditorView>(null);

  // biome-ignore lint: manual dependency list
  React.useEffect(() => {
    if (!divRef.current) return;
    const state = EditorState.create({
      extensions: [basicSetup],
    });
    const editor = new EditorView({
      ...config,
      state,
      parent: divRef.current,
    });
    (editorRef.current as any) = editor;
    const unbind = bind(str, editor, true);
    return () => {
      unbind();
    };
  }, []);

  return <div ref={divRef} {...rest} />;
};
