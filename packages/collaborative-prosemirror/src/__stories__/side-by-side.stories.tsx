import * as React from 'react';
import preview from '../../../../.storybook/preview';
import {ModelWithExt, ext} from 'json-joy/lib/json-crdt-extensions';
import {DemoCard} from '@jsonjoy.com/collaborative-ui/lib/DemoCard';
import {SideBySideSync} from '@jsonjoy.com/collaborative-ui/lib/SideBySideSync';
import {Markdown} from '@jsonjoy.com/ui/lib/markdown/Markdown';
import {ProseMirrorEditor} from './ProseMirrorEditor';
import {FromPm} from '../sync/FromPm';
import {addListNodes} from 'prosemirror-schema-list';
import {Schema} from 'prosemirror-model';
import {schema} from 'prosemirror-schema-basic';

import 'prosemirror-view/style/prosemirror.css';
import 'prosemirror-menu/style/menu.css';

const DESCRIPTION = `
\`@jsonjoy.com/collaborative-prosemirror\` integrates [json-joy](https://github.com/streamich/json-joy)
JSON CRDT (Peritext) with [ProseMirror](https://prosemirror.net/), enabling real-time
collaborative rich-text editing.

Install the package and its peer dependencies:

\`\`\`bash
npm install @jsonjoy.com/collaborative-prosemirror prosemirror-model prosemirror-state prosemirror-view
\`\`\`

Use \`PeritextBinding.bind()\` to connect ProseMirror to a Peritext CRDT node — it returns an unbind cleanup function:

\`\`\`ts
const unbind = PeritextBinding.bind(peritextRef, facade);
\`\`\`
`;

const meta = preview.meta({
  title: 'ProseMirror',
});

// Mix the nodes from prosemirror-schema-list into the basic schema to
// create a schema with list support.
const mySchema = new Schema({
  nodes: addListNodes(schema.spec.nodes, 'paragraph block*', 'block'),
  marks: schema.spec.marks,
});

const Demo: React.FC = () => {
  const model = React.useMemo(() => {
    const json = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {type: 'text', text: '@jsonjoy.com/collaborative-prosemirror', marks: [{type: 'code'}]},
            {type: 'text', text: ' integrates '},
            {type: 'text', text: 'json-joy', marks: [{type: 'code'}]},
            {type: 'text', text: ' '},
            {type: 'text', text: 'JSON CRDT (Peritext)', marks: [{type: 'strong'}]},
            {type: 'text', text: ' with '},
            {type: 'text', text: 'ProseMirror', marks: [{type: 'strong'}]},
            {type: 'text', text: ' for real-time collaborative rich-text editing.'},
          ],
        },
        {type: 'paragraph', content: [{type: 'text', text: 'Installation:'}]},
        {type: 'code_block', content: [{type: 'text', text: 'npm install @jsonjoy.com/collaborative-prosemirror'}]},
        {
          type: 'paragraph',
          content: [
            {type: 'text', text: 'Call '},
            {type: 'text', text: 'PeritextBinding.bind(peritextRef, facade)', marks: [{type: 'code'}]},
            {type: 'text', text: ' to sync ProseMirror to a CRDT node. It returns an '},
            {type: 'text', text: 'unbind', marks: [{type: 'strong'}]},
            {type: 'text', text: ' cleanup function:'},
          ],
        },
        {type: 'code_block', content: [{type: 'text', text: "const unbind = bind(peritextRef, facade);"}]},
      ],
    };
    const model = ModelWithExt.create(ext.peritext.new(''));
    const viewRange = FromPm.convert(mySchema.nodeFromJSON(json));
    const txt = model.s.toExt().txt;
    txt.editor.merge(viewRange);
    txt.refresh();
    return model;
  }, []);

  return (
    <DemoCard
      title={<Markdown inline src={'ProseMirror Editor'} />}
      subtitle={<Markdown inline src={'Collaborative ProseMirror editor synchronization example'} />}
      description={<Markdown src={DESCRIPTION} />}
    >
      <SideBySideSync
        model={model}
        noDisplayHdr
        // renderDisplay={(model) => <Editor model={model} />}
        renderDisplay={(model, readonly, presence) => (
          <ProseMirrorEditor model={model} readonly={readonly} presence={presence} />
        )}
      />
    </DemoCard>
  );
};

export const SideBySide = meta.story({
  render: Demo,
});
