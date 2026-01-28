import * as React from 'react';
import {Model, s} from 'json-joy/lib/json-crdt';
import {CollaborativeInput} from '@jsonjoy.com/collaborative-input-react';
import {Markdown} from '@jsonjoy.com/ui/lib/markdown/Markdown';
import {SideBySideSync} from '../..';
import {DemoCard} from '../../../DemoCard';

export default {
  title: 'side-by-side',
};

export interface SbsCollabInputDemoProps {
  multiline?: boolean;
}

export const SbsCollabInputDemo: React.FC<SbsCollabInputDemoProps> = ({multiline}) => {
  const model = React.useMemo(() => {
    const schema = s.obj({
      text: s.str(`Hello, collaborative <${multiline ? 'textarea' : 'input'}>!`),
    });
    return Model.create(schema)
  }, []);
  const subtitleText = React.useMemo(() => {
    return 'Two-way synchronization of basic DOM `<' + (multiline ? 'textarea' : 'input') + '>` element rendered by `<CollaborativeInput>` React component';
  }, [multiline]);  

  const description = React.useMemo(() => {
    return`
This demo showcases synchronization of two text areas using
the \`CollaborativeInput\` component. You can type in either text
area, and the changes will be reflected in both areas after synchronization.
Use the top bar buttons to manually synchronize or adjust auto-sync settings.

The \`<CollaborativeInput>\` React component binds a JSON CRDT "str" node to
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
  }, [multiline]);  

  return (
    <DemoCard
      title={<Markdown inline src={'`CollaborativeInput` Component'} />}
      subtitle={<Markdown inline src={subtitleText} />}
      description={<Markdown src={description} />}
    >
      <SideBySideSync
        model={model}
        noDisplayHdr
        renderDisplay={(model: Model<any>) => (
            <CollaborativeInput
              str={() => model.api.str(['text'])}
              multiline={multiline}
              style={{
                width: '100%',
                height: multiline ? 200 : undefined,
                fontSize: 16,
                boxSizing: 'border-box',
              }}
            />
        )}
      />
    </DemoCard>
  );
};
