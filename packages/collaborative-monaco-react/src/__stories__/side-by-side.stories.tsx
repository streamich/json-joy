import * as React from 'react';
import preview from '../../../../.storybook/preview';
import {Model, s} from 'json-joy/lib/json-crdt';
import type {Model as JsonCrdtModel} from 'json-joy/lib/json-crdt';
import {DemoCard} from '@jsonjoy.com/collaborative-ui/lib/DemoCard';
import {SideBySideSync} from '@jsonjoy.com/collaborative-ui/lib/SideBySideSync';
import {Markdown} from '@jsonjoy.com/ui/lib/markdown/Markdown';
import * as monaco from 'monaco-editor';
import {loader} from '@monaco-editor/react';
import {CollaborativeMonaco} from '..';
import type {PresenceManager} from '@jsonjoy.com/collaborative-presence';

loader.config({monaco});

const DESCRIPTION = `
\`@jsonjoy.com/collaborative-monaco-react\` integrates [json-joy](https://github.com/streamich/json-joy)
JSON CRDT with [Monaco Editor](https://microsoft.github.io/monaco-editor/), enabling real-time
collaborative plain-text editing.

Install the package and its peer dependencies:

\`\`\`bash
npm install @jsonjoy.com/collaborative-monaco-react monaco-editor @monaco-editor/react
\`\`\`

Create a JSON CRDT model with a string node and pass the \`str\` prop to \`<CollaborativeMonaco>\`:

\`\`\`tsx
const model = Model.create(s.str('Hello World'));

<CollaborativeMonaco str={() => model.s.$} height="200px" />
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
      <CollaborativeMonaco
        width={'100%'}
        height={'200px'}
        str={() => (model.s as any).$}
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
        'Integration of json-joy JSON CRDT with Monaco Editor.\n' +
          '\n' +
          'Enabling real-time collaborative plain-text editing.\n' +
          '\n' +
          'Type in either editor to see changes synchronized in real-time!\n',
      ),
    );
  }, []);

  return (
    <DemoCard
      title={<Markdown inline src={'Monaco Editor'} />}
      subtitle={<Markdown inline src={'Collaborative Monaco editor synchronization example'} />}
      description={<Markdown src={DESCRIPTION} />}
    >
      <SideBySideSync
        model={model}
        noDisplayHdr
        renderDisplay={(m: JsonCrdtModel<any>, _readonly: boolean, presence?: PresenceManager) => <Editor model={m} presence={presence} />}
      />
    </DemoCard>
  );
};

const meta = preview.meta({
  title: 'Monaco',
});

export const SideBySide = meta.story(() => <Demo />);
