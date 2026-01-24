import * as React from 'react';
import {Model} from 'json-joy/lib/json-crdt';
import {CollaborativeAce} from '.';
import type {Ace} from 'ace-builds';
import type {Meta, StoryObj} from '@storybook/react';

interface EditorProps {
  src: string;
}

const Editor: React.FC<EditorProps> = ({src = ''}) => {
  const editorRef = React.useRef<Ace.Editor>(null);
  const [model, clone] = React.useMemo(() => {
    const model = Model.create();
    model.api.root(src);
    return [model, model.clone()];
  }, [src]);
  React.useSyncExternalStore(model.api.subscribe, () => model.tick);

  const insert = (text: string, position?: number) => {
    const editor = editorRef.current;
    if (!editor) return;
    const session = editor.session;
    const doc = session.doc;
    const pos = position ?? editor.getValue().length;
    const docPos = doc.indexToPosition(pos, 0);
    session.insert(docPos, text);
  };

  return (
    <div>
      <CollaborativeAce
        str={() => model.api.str([])}
        onLoad={(editor) => {
          (editorRef as any).current = editor;
        }}
        style={{border: '1px solid #aaa'}}
      />
      <div>
        <button type={'button'} onClick={() => insert('!')}>
          Append "!" to editor
        </button>
      </div>
      <div>
        <button
          type={'button'}
          onClick={() =>
            setTimeout(() => {
              const str = model.api.str([]);
              str.ins(str.length(), '?');
            }, 2000)
          }
        >
          Append "?" to model after 2s
        </button>
      </div>
      <div>
        <button
          type={'button'}
          onClick={() =>
            setTimeout(() => {
              const ace = editorRef.current;
              if (!ace) return;
              const pos = ace.session.doc.indexToPosition(ace.getValue().length, 0);
              ace.session.insert(pos, '!');
            }, 2000)
          }
        >
          Append "!" to editor after 2s
        </button>
      </div>
      <div>
        <button
          type={'button'}
          onClick={() =>
            setTimeout(() => {
              model.api.str([]).ins(0, '1. ');
            }, 2000)
          }
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
      <div>
        <button
          type={'button'}
          onClick={() => {
            setTimeout(() => {
              model.api.str([]).del(0, 1);
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
  title: 'collaborative-ace-react/Ace Editor',
  component: Editor as any,
  argTypes: {},
};

export default meta;

export const Primary: StoryObj<typeof meta> = {
  args: {
    src: 'gl',
  },
};
