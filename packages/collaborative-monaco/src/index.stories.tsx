import * as React from 'react';
import {Model, s} from 'json-joy/lib/json-crdt';
import type {Meta, StoryObj} from '@storybook/react';
import * as monaco from 'monaco-editor';
import {monarchLatexLang} from './__tests__/latexLang';
import {CollaborativeMonaco} from './CollaborativeMonaco';

monaco.languages.register({
  id: 'latex',
});
monaco.languages.setMonarchTokensProvider('latex', monarchLatexLang as any);

interface EditorProps {
  src: string;
}

const Editor: React.FC<EditorProps> = ({
  src = `\\documentclass[12pt]{article}
\\usepackage{lingmacros}
\\usepackage{tree-dvips}
\\begin{document}

\\section*{Notes for My Paper}
`,
}) => {
  const editorRef = React.useRef<monaco.editor.IStandaloneCodeEditor>(null);
  const [model, clone] = React.useMemo(() => {
    const model = Model.create(s.str(src));
    return [model, model.clone()];
  }, [src]);
  React.useSyncExternalStore(model.api.subscribe, () => model.tick);

  const insert = (text: string, position?: number) => {
    const editor = editorRef.current;
    if (!editor) return;
    const editorModel = editor.getModel();
    if (!editorModel) return;
    const value = editorModel.getValue();
    const start = editorModel.getPositionAt(position ?? value.length);
    const end = length ? editorModel.getPositionAt(position ?? value.length) : start;
    const range = new monaco.Range(start.lineNumber, start.column, end.lineNumber, end.column);
    editorModel.applyEdits([{range, text}]);
  };

  return (
    <div>
      <CollaborativeMonaco
        height={'200px'}
        str={() => model.s.$}
        options={{
          language: 'latex',
        }}
        onMount={(editor) => {
          (editorRef as any).current = editor;
        }}
      />
      <div>
        <button type={'button'} onClick={() => insert('!')}>
          Append "!" to editor
        </button>
      </div>
      <div>
        <button
          type={'button'}
          onClick={() => {
            setTimeout(() => {
              insert('?');
            }, 2000);
          }}
        >
          Append "?" to editor after 2s
        </button>
      </div>
      <div>
        <button
          type={'button'}
          onClick={() => {
            setTimeout(() => {
              const str = model.s.$;
              str.ins(str.length(), '?');
            }, 2000);
          }}
        >
          Append "?" to model after 2s
        </button>
      </div>
      <div>
        <button
          type={'button'}
          onClick={() => {
            setTimeout(() => {
              insert('1. ', 0);
            }, 2000);
          }}
        >
          Prepend "1. " to editor after 2s
        </button>
      </div>
      <div>
        <button
          type={'button'}
          onClick={() => {
            setTimeout(() => {
              const str = model.s.$;
              str.ins(0, '1. ');
            }, 2000);
          }}
        >
          Prepend "1. " to model after 2s
        </button>
      </div>
      <div>
        <button
          type={'button'}
          onClick={() => {
            setTimeout(() => {
              model.reset(clone);
            }, 2000);
          }}
        >
          RESET after 2s
        </button>
      </div>
      <pre style={{fontSize: '10px'}}>
        <code>{model.root + ''}</code>
      </pre>
    </div>
  );
};

const meta: Meta<EditorProps> = {
  title: 'collaborative-monaco/Monaco Editor',
  component: Editor as any,
  argTypes: {},
};

export default meta;

export const Primary: StoryObj<typeof meta> = {
  args: {},
};
