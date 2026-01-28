import * as React from 'react';
import {Model, s} from 'json-joy/lib/json-crdt';
import {SideBySideSync} from '@jsonjoy.com/collaborative-ui/lib/SideBySideSync';
import {Markdown} from '@jsonjoy.com/ui/lib/markdown/Markdown';
import {DemoCard} from '@jsonjoy.com/collaborative-ui/lib/DemoCard';
import {CollaborativeInput} from '../CollaborativeInput';

export default {
  title: 'side-by-side',
};

const schema0 = s.obj({
  text: s.str('Hello world!'),
});

const model = Model.create(schema0);

const description = `
This demo showcases synchronization of two text areas using
the \`CollaborativeInput\` component. You can type in either text
area, and the changes will be reflected in both areas after synchronization.
Use the top bar buttons to manually synchronize or adjust auto-sync settings.

The \`<CollaborartiveInput>\` React component binds a JSON CRDT "str" node to
either \`<input>\` or \`<textarea>\` DOM element. You provide the JSON "str" node
via the \`str\` prop, and a render prop \`input\` that receives a \`ref\` to be
attached to the desired DOM element:

\`\`\`jsx
<CollaborativeInput
  str={() => model.api.str(['text'])}
  input={(connect) => <textarea ref={connect} />}
/>
\`\`\`
`;

export const Default = {
  render: () => (
    <DemoCard
      title={<Markdown inline src={'`CollaborativeInput` Component'} />}
      subtitle={<Markdown inline src={'Two-way synchronization of basic DOM `<input>` element rendered by `<CollaborativeInput>` React component'} />}
      description={<Markdown src={description} />}
    >
      <SideBySideSync
        model={model}
        renderDisplay={(model: Model<any>) => (
            <CollaborativeInput
              str={() => model.api.str(['text'])}
              input={(connect) => (
                <textarea ref={connect} />
              )}
            />
        )}
      />
    </DemoCard>
  ),
};
