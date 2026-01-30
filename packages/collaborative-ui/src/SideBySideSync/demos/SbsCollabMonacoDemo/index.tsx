import * as React from 'react';
import {Model, s} from 'json-joy/lib/json-crdt';
import {CollaborativeMonaco} from '@jsonjoy.com/collaborative-monaco-react';
import {Markdown} from '@jsonjoy.com/ui/lib/markdown/Markdown';
import {SideBySideSync} from '../..';
import {DemoCard} from '../../../DemoCard';
import Paper from '@jsonjoy.com/ui/lib/4-card/Paper';

const DESCRIPTION = `
This demo showcases synchronization of two Monaco Editor instances using
the \`CollaborativeMonaco\` component from \`@jsonjoy.com/collaborative-monaco-react\` package.

You can type in either editor, and the changes will be reflected in both editors
after synchronization. Use the top bar buttons to manually synchronize or adjust
auto-sync settings.

The \`<CollaborativeMonaco>\` React component binds a JSON CRDT "str" node to
a Monaco editor instance. You provide the JSON "str" node
via the \`str\` prop, and can optionally specify editor options such as height via props:

\`\`\`jsx
<CollaborativeMonaco
  str={() => model.api.str(['text'])}
  height='200px'
/>
\`\`\`
`;

export interface SbsCollabMonacoDemoProps {}

export const SbsCollabMonacoDemo: React.FC<SbsCollabMonacoDemoProps> = ({}) => {
  const model = React.useMemo(() => {
    const schema = s.obj({
      text: s.str(`This is a collaborative Monaco Editor example.

You can edit the text here, and see changes
synchronized in the other editor!
`),
    });
    return Model.create(schema)
  }, []);

  return (
    <DemoCard
      title={<Markdown inline src={'Monaco Editor'} />}
      subtitle={<Markdown inline src={'Synchronization example using the `@jsonjoy.com/collaborative-monaco-react` package'} />}
      description={<Markdown src={DESCRIPTION} />}
    >
      <SideBySideSync
        model={model}
        noDisplayHdr
        renderDisplay={(model: Model<any>) => (
          <Paper style={{overflow: 'hidden', width: '100%'}} contrast>
            <div style={{width: '100%', height: 200}} onKeyDown={(e) => e.stopPropagation()}>
              <CollaborativeMonaco
                height={'200px'}
                str={() => model.api.str(['text'])}
                options={{
                  language: 'javascript',
                }}
              />
            </div>
          </Paper>
        )}
      />
    </DemoCard>
  );
};
