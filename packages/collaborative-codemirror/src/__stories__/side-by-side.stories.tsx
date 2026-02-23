import * as React from 'react';
import preview from '../../../../.storybook/preview';
import {Model, s} from 'json-joy/lib/json-crdt';
import {DemoCard} from '@jsonjoy.com/collaborative-ui/lib/DemoCard';
import {SideBySideSync} from '@jsonjoy.com/collaborative-ui/lib/SideBySideSync';
import {Markdown} from '@jsonjoy.com/ui/lib/markdown/Markdown';
import {EditorView} from 'codemirror';
import {bind} from '..';

const DESCRIPTION = `
\`@jsonjoy.com/collaborative-codemirror\` integrates [json-joy](https://github.com/streamich/json-joy)
JSON CRDT with [CodeMirror 6](https://codemirror.net/), enabling real-time
collaborative plain-text editing.

Install the package and its peer dependencies:

\`\`\`bash
npm install @jsonjoy.com/collaborative-codemirror codemirror
\`\`\`

Use \`bind()\` to connect a CodeMirror \`EditorView\` to a JSON CRDT string node — it returns an unbind cleanup function:

\`\`\`ts
const unbind = bind(() => model.s.$, editor);
\`\`\`
`;

interface EditorProps {
  model: Model<any>;
}

const Editor: React.FC<EditorProps> = ({model}) => {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!ref.current) return;
    const editor = new EditorView({parent: ref.current});
    const unbind = bind(() => (model.s as any).$, editor);
    return () => {
      unbind();
      editor.destroy();
    };
  }, [model]);

  return (
    <div
      ref={ref}
      style={{
        width: '100%',
        minHeight: '200px',
        fontSize: '14px',
        border: '1px solid #bbb',
        borderRadius: '4px',
        boxSizing: 'border-box',
      }}
    />
  );
};

const Demo: React.FC = () => {
  const model = React.useMemo(() => {
    return Model.create(
      s.str(
        'Integration of json-joy JSON CRDT with CodeMirror 6.\n' +
        '\n' +
        'Enabling real-time collaborative plain-text editing.\n' +
        '\n' +
        'Type in either editor to see changes synchronized in real-time!\n'),
    );
  }, []);

  return (
    <DemoCard
      title={<Markdown inline src={'CodeMirror Editor'} />}
      subtitle={<Markdown inline src={'Collaborative CodeMirror v6 editor synchronization example'} />}
      description={<Markdown src={DESCRIPTION} />}
    >
      <SideBySideSync
        model={model}
        noDisplayHdr
        renderDisplay={(model) => <Editor model={model} />}
      />
    </DemoCard>
  );
};

const meta = preview.meta({
  title: 'CodeMirror',
});

export const SideBySide = meta.story(() => <Demo />);
