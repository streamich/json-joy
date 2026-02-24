import * as React from 'react';
import preview from '../../../../.storybook/preview';
import {Model, s} from 'json-joy/lib/json-crdt';
import type {Model as JsonCrdtModel} from 'json-joy/lib/json-crdt';
import {DemoCard} from '@jsonjoy.com/collaborative-ui/lib/DemoCard';
import {SideBySideSync} from '@jsonjoy.com/collaborative-ui/lib/SideBySideSync';
import {Markdown} from '@jsonjoy.com/ui/lib/markdown/Markdown';
import {CollaborativeAce} from '..';
import type {PresenceManager} from '@jsonjoy.com/collaborative-presence';

const DESCRIPTION = `
\`@jsonjoy.com/collaborative-ace-react\` integrates [json-joy](https://github.com/streamich/json-joy)
JSON CRDT with [Ace Editor](https://ace.c9.io/), enabling real-time
collaborative plain-text editing.

Install the package and its peer dependencies:

\`\`\`bash
npm install @jsonjoy.com/collaborative-ace-react ace-builds react-ace
\`\`\`

Create a JSON CRDT model with a string node and pass the \`str\` prop to \`<CollaborativeAce>\`:

\`\`\`tsx
const model = Model.create(s.str('Hello World'));

<CollaborativeAce str={() => model.s.$} width="100%" height="200px" />
\`\`\`
`;

interface EditorProps {
  model: JsonCrdtModel<any>;
  presence?: PresenceManager;
}

const Editor: React.FC<EditorProps> = ({model, presence}) => {
  return (
    <div
      style={{display: 'flex', flexDirection: 'column', width: '100%', height: '200px'}}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <CollaborativeAce
        str={() => (model.s as any).$}
        width={'100%'}
        height={'200px'}
        style={{border: '1px solid #bbb', borderRadius: '4px', boxSizing: 'border-box'}}
        presence={presence}
        userFromMeta={(m: any) => m}
      />
    </div>
  );
};

const Demo: React.FC = () => {
  const model = React.useMemo(() => {
    return Model.create(
      s.str(
        'Integration of json-joy JSON CRDT with Ace Editor.\n' +
          '\n' +
          'Enabling real-time collaborative plain-text editing.\n' +
          '\n' +
          'Type in either editor to see changes synchronized in real-time!\n',
      ),
    );
  }, []);

  return (
    <DemoCard
      title={<Markdown inline src={'Ace Editor'} />}
      subtitle={<Markdown inline src={'Collaborative Ace editor synchronization example'} />}
      description={<Markdown src={DESCRIPTION} />}
    >
      <SideBySideSync
        model={model}
        noDisplayHdr
        renderDisplay={(model, _readonly, presence) => <Editor model={model} presence={presence} />}
      />
    </DemoCard>
  );
};

const meta = preview.meta({
  title: 'Ace',
});

export const SideBySide = meta.story(() => <Demo />);
