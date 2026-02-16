import * as React from 'react';
import preview from '../../../../../.storybook/preview';
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

const meta = preview.meta({
  title: 'ProseMirror',
});

// Mix the nodes from prosemirror-schema-list into the basic schema to
// create a schema with list support.
const mySchema = new Schema({
  nodes: addListNodes(schema.spec.nodes, 'paragraph block*', 'block'),
  marks: schema.spec.marks,
});

const Demo: React.FC<{}> = ({}) => {
  const model = React.useMemo(() => {
    const json = {"type":"doc","content":[
      {"type":"paragraph","content":[{"type":"text","text":"Hello, ProseMirror!"}]},
      {"type":"paragraph","content":[
        {"type":"text","text":"This is a basic "},
        {"type":"text","text":"rich text","marks":[{"type":"strong"},{"type":"em"}]},
        {"type":"text","text":" editor."},
      ]}
    ]};
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
      description={<Markdown src={'description ...'} />}
    >
      <SideBySideSync
        model={model}
        noDisplayHdr
        // renderDisplay={(model) => <Editor model={model} />}
        renderDisplay={(model) => <ProseMirrorEditor model={model} />}
      />
    </DemoCard>
  );
};

export const SideBySide = meta.story({
  render: Demo,
});
