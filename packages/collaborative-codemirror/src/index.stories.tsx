import * as React from 'react';
import {Model, s} from 'json-joy/lib/json-crdt';
import type {Meta, StoryObj} from '@storybook/react';
import {EditorView} from 'codemirror';
import {bind} from '.';

interface EditorProps {
  src: string;
}

const Editor: React.FC<EditorProps> = ({src = ''}) => {
  const divEl = React.useRef<HTMLDivElement>(null);
  const editorRef = React.useRef<EditorView>(null);
  const [model, clone] = React.useMemo(() => {
    const model = Model.create(s.str(src));
    return [model, model.clone()];
  }, []);
  React.useEffect(() => {
    if (!divEl.current) return;
    const editor = new EditorView({
      parent: divEl.current,
    });
    (editorRef.current as any) = editor;
    const unbind = bind(() => model.s.$, editor, true);
    return () => {
      unbind();
    };
  }, [model]);
  React.useSyncExternalStore(model.api.subscribe, () => model.tick);

  const insert = (text: string, position?: number) => {
    const editor = editorRef.current;
    if (!editor) return;
    const state = editor.state;
    editor.dispatch({
      changes: {
        from: position ?? state.doc.length,
        to: position ?? state.doc.length,
        insert: text,
      },
    });
  };

  return (
    <div>
      <div className="Editor" ref={divEl} style={{width: 800, minHeight: 250, border: '1px solid #ddd'}} />
      <div>
        <button onClick={() => insert('!')}>Append "!" to editor</button>
      </div>
      <div>
        <button
          onClick={() =>
            setTimeout(() => {
              const str = model.s.$;
              str.ins(str.length(), '?');
            }, 2000)
          }
        >
          Append "?" to model after 2s
        </button>
      </div>
      <div>
        <button
          onClick={() =>
            setTimeout(() => {
              model.s.$.ins(0, '1. ');
            }, 2000)
          }
        >
          Prepend "1. " to model after 2s
        </button>
      </div>
      <div>
        <button
          onClick={() => {
            setTimeout(() => {
              model.reset(clone);
            }, 2000);
          }}
        >
          RESET after 2s
        </button>
      </div>
      <div>
        <button
          onClick={() => {
            setTimeout(() => {
              model.s.$.del(0, 1);
            }, 2000);
          }}
        >
          Delete model first char after 2s
        </button>
      </div>
      <pre style={{fontSize: '10px'}}>
        <code>{model.root + ''}</code>
      </pre>
    </div>
  );
};

const meta: Meta<EditorProps> = {
  title: 'collaborative-codemirror/CodeMirror Editor',
  component: Editor as any,
  argTypes: {},
};

export default meta;

export const Primary: StoryObj<typeof meta> = {
  args: {
    src: 'gl',
  },
};
