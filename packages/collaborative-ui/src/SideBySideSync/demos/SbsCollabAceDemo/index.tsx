import * as React from 'react';
import {Model, s} from 'json-joy/lib/json-crdt';
import {CollaborativeAce} from '@jsonjoy.com/collaborative-ace-react';
import {Markdown} from '@jsonjoy.com/ui/lib/markdown/Markdown';
import {SideBySideSync} from '../..';
import {DemoCard} from '../../../DemoCard';
import Paper from '@jsonjoy.com/ui/lib/4-card/Paper';

const DESCRIPTION = `
This demo showcases synchronization of two Ace Editor instances using
the \`CollaborativeAce\` component from \`@jsonjoy.com/collaborative-ace-react\` package.

You can type in either editor, and the changes will be reflected in both editors
after synchronization. Use the top bar buttons to manually synchronize or adjust
auto-sync settings.

The \`<CollaborativeAce>\` React component binds a JSON CRDT "str" node to
an Ace editor instance. You provide the JSON "str" node
via the \`str\` prop, and can optionally specify editor options such as height via props:

\`\`\`jsx
<CollaborativeAce
  str={() => model.api.str(['text'])}
  height='200px'
/>
\`\`\`
`;

export type SbsCollabAceDemoProps = {};

export const SbsCollabAceDemo: React.FC<SbsCollabAceDemoProps> = () => {
  const model = React.useMemo(() => {
    const schema = s.obj({
      text: s.str(`This is a collaborative Ace Editor example.

You can edit the text here, and see changes
synchronized in real-time!
`),
    });
    return Model.create(schema);
  }, []);

  return (
    <DemoCard
      title={<Markdown inline src={'Ace Editor'} />}
      subtitle={
        <Markdown
          inline
          src={
            'Collaborative Ace editor synchronization example, using the `@jsonjoy.com/collaborative-ace-react` package'
          }
        />
      }
      description={<Markdown src={DESCRIPTION} />}
    >
      <SideBySideSync
        model={model}
        noDisplayHdr
        renderDisplay={(model: Model<any>) => (
          <Paper style={{overflow: 'hidden'}} contrast>
            <CollaborativeAce str={() => model.api.str(['text'])} height="200px" />
          </Paper>
        )}
      />
    </DemoCard>
  );
};
