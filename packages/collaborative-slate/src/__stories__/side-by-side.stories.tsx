import * as React from 'react';
import preview from '../../../../.storybook/preview';
import {ModelWithExt, ext} from 'json-joy/lib/json-crdt-extensions';
import {DemoCard} from '@jsonjoy.com/collaborative-ui/lib/DemoCard';
import {SideBySideSync} from '@jsonjoy.com/collaborative-ui/lib/SideBySideSync';
import {Markdown} from '@jsonjoy.com/ui/lib/markdown/Markdown';
import {SlateEditor} from './SlateEditor';
import {FromSlate} from '../sync/FromSlate';

const meta = preview.meta({
  title: 'Slate',
});

const Demo: React.FC<{}> = ({}) => {
  const model = React.useMemo(() => {
    const slateDoc = [
      {type: 'paragraph', children: [{text: 'Hello, Slate!'}]},
      {
        type: 'paragraph',
        children: [{text: 'This is a basic '}, {text: 'rich text', bold: true, italic: true}, {text: ' editor.'}],
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
      description={<Markdown src={'description ...'} />}
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
