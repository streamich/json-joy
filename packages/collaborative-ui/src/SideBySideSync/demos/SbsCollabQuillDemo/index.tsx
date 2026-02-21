import * as React from 'react';
import {ModelWithExt, ext} from 'json-joy/lib/json-crdt-extensions';
import {CollaborativeQuill} from '@jsonjoy.com/collaborative-quill-react';
import {Markdown} from '@jsonjoy.com/ui/lib/markdown/Markdown';
import {SideBySideSync} from '../..';
import {DemoCard} from '../../../DemoCard';
import Paper from '@jsonjoy.com/ui/lib/4-card/Paper';
import type {Model} from 'json-joy/lib/json-crdt';

const DESCRIPTION = `
This demo showcases synchronization of two Quill Editor instances using
the \`CollaborativeQuill\` component from \`@jsonjoy.com/collaborative-quill-react\` package.

You can type in either editor, and the changes will be reflected in both editors
after synchronization. Use the top bar buttons to manually synchronize or adjust
auto-sync settings.

The \`<CollaborativeQuill>\` React component binds a JSON CRDT "quill" extension node to
a Quill editor instance. You provide the Quill Delta API via the \`api\` prop:

\`\`\`jsx
const model = ModelWithExt.create(ext.quill.new('Hello World'));

<CollaborativeQuill
  api={() => model.s.toExt()}
/>
\`\`\`
`;

export interface SbsCollabQuillDemoProps {}

export const SbsCollabQuillDemo: React.FC<SbsCollabQuillDemoProps> = ({}) => {
  const model = React.useMemo(() => {
    return ModelWithExt.create(
      ext.quill.new(`This is a collaborative Quill Editor example.

You can edit the text here, and see changes synchronized in the other editor!`),
    );
  }, []);

  return (
    <DemoCard
      title={<Markdown inline src={'Quill Editor'} />}
      subtitle={
        <Markdown inline src={'Synchronization example using the `@jsonjoy.com/collaborative-quill-react` package'} />
      }
      description={<Markdown src={DESCRIPTION} />}
    >
      <SideBySideSync
        model={model}
        noDisplayHdr
        renderDisplay={(model: Model<any>) => (
          <Paper style={{overflow: 'hidden', width: '100%'}} contrast>
            <div style={{width: '100%', height: 200}} onKeyDown={(e) => e.stopPropagation()}>
              <CollaborativeQuill style={{height: '200px'}} api={() => (model as any).s.toExt()} />
            </div>
          </Paper>
        )}
      />
    </DemoCard>
  );
};
