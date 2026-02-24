import * as React from 'react';
import preview from '../../../../.storybook/preview';
import {ModelWithExt, ext} from 'json-joy/lib/json-crdt-extensions';
import {DemoCard} from '@jsonjoy.com/collaborative-ui/lib/DemoCard';
import {SideBySideSync} from '@jsonjoy.com/collaborative-ui/lib/SideBySideSync';
import {Markdown} from '@jsonjoy.com/ui/lib/markdown/Markdown';
import {SlateEditor} from './SlateEditor';
import {FromSlate} from '../sync/FromSlate';

const DESCRIPTION = `
\`@jsonjoy.com/collaborative-slate\` integrates [json-joy](https://github.com/streamich/json-joy)
JSON CRDT (Peritext) with [Slate.js](https://github.com/ianstormtaylor/slate), enabling real-time
collaborative rich-text editing.

Install the package and its peer dependencies:

\`\`\`bash
npm install @jsonjoy.com/collaborative-slate slate slate-react
\`\`\`

Use \`bind()\` to connect your Slate editor to a Peritext CRDT node — it returns an unbind cleanup function:

\`\`\`ts
const unbind = bind(() => model.s.toExt(), editor);
\`\`\`
`;

const meta = preview.meta({
  title: 'Slate',
});

const Demo: React.FC = () => {
  const model = React.useMemo(() => {
    const slateDoc = [
      {
        type: 'paragraph',
        children: [
          {text: '@jsonjoy.com/collaborative-slate', code: true},
          {text: ' integrates '},
          {text: 'json-joy', code: true},
          {text: ' '},
          {text: 'JSON CRDT (Peritext)', bold: true},
          {text: ' with '},
          {text: 'Slate.js', bold: true},
          {text: ' for real-time collaborative rich-text editing.'},
        ],
      },
      {
        type: 'paragraph',
        children: [{text: 'Installation:'}],
      },
      {
        type: 'code-block',
        children: [{text: 'npm install @jsonjoy.com/collaborative-slate'}],
      },
      {
        type: 'paragraph',
        children: [
          {text: 'Call '},
          {text: 'bind(peritextRef, editor)', code: true},
          {text: ' to sync the editor to a CRDT node. It returns an '},
          {text: 'unbind', bold: true},
          {text: ' cleanup function:'},
        ],
      },
      {
        type: 'code-block',
        children: [
          {text: "import {bind} from '@jsonjoy.com/collaborative-slate';\nconst unbind = bind(peritextRef, editor);"},
        ],
      },
    ];
    const model = ModelWithExt.create(ext.peritext.new(''));
    const viewRange = FromSlate.convert(slateDoc as any);
    const txt = model.s.toExt().txt;
    txt.editor.merge(viewRange);
    txt.refresh();
    return model;
  }, []);

  return (
    <DemoCard
      title={<Markdown inline src={'Slate.js Editor'} />}
      subtitle={<Markdown inline src={'Collaborative Slate.js editor synchronization example'} />}
      description={<Markdown src={DESCRIPTION} />}
    >
      <SideBySideSync
        model={model}
        noDisplayHdr
        renderDisplay={(model, readonly, presence) => <SlateEditor model={model} presence={presence} />}
      />
    </DemoCard>
  );
};

export const SideBySide = meta.story({
  render: Demo,
});
