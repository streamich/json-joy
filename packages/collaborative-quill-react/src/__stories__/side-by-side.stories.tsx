import * as React from 'react';
import preview from '../../../../.storybook/preview';
import {ModelWithExt, ext} from 'json-joy/lib/json-crdt-extensions';
import {DemoCard} from '@jsonjoy.com/collaborative-ui/lib/DemoCard';
import {SideBySideSync} from '@jsonjoy.com/collaborative-ui/lib/SideBySideSync';
import {Markdown} from '@jsonjoy.com/ui/lib/markdown/Markdown';
import Paper from '@jsonjoy.com/ui/lib/4-card/Paper';
import {CollaborativeQuill} from '..';
import type {Model} from 'json-joy/lib/json-crdt';
import type {PresenceManager} from '@jsonjoy.com/collaborative-presence';

const DESCRIPTION = `
\`@jsonjoy.com/collaborative-quill-react\` integrates [json-joy](https://github.com/streamich/json-joy)
JSON CRDT with [Quill](https://quilljs.com/), enabling real-time
collaborative rich-text editing.

Install the package and its peer dependencies:

\`\`\`bash
npm install @jsonjoy.com/collaborative-quill-react quill
\`\`\`

Create a JSON CRDT model with the \`quill\` extension and pass the \`api\` prop to \`<CollaborativeQuill>\`:

\`\`\`tsx
const model = ModelWithExt.create(ext.quill.new('Hello World'));

<CollaborativeQuill api={() => model.s.toExt()} />
\`\`\`
`;

const Demo: React.FC = () => {
  const model = React.useMemo(() => {
    return ModelWithExt.create(
      ext.quill.new(
        'Integration of json-joy JSON CRDT with Quill.\n' +
          '\n' +
          'Enabling real-time collaborative rich-text editing.\n' +
          '\n' +
          'Type in either editor to see changes synchronized in real-time!\n',
      ),
    );
  }, []);

  return (
    <DemoCard
      title={<Markdown inline src={'Quill Editor'} />}
      subtitle={<Markdown inline src={'Collaborative Quill editor synchronization example'} />}
      description={<Markdown src={DESCRIPTION} />}
    >
      <SideBySideSync
        model={model}
        noDisplayHdr
        renderDisplay={(m: Model<any>, _readonly: boolean, presence?: PresenceManager) => (
          <Paper style={{overflow: 'hidden', width: '100%'}} contrast>
            <div style={{width: '100%', height: 200}} onKeyDown={(e) => e.stopPropagation()}>
              <CollaborativeQuill
                style={{height: '200px'}}
                api={() => (m as any).s.toExt()}
                presence={presence}
                userFromMeta={(m: any) => m}
              />
            </div>
          </Paper>
        )}
      />
    </DemoCard>
  );
};

const meta = preview.meta({
  title: 'Quill',
});

export const SideBySide = meta.story(() => <Demo />);
