import * as React from 'react';
import {Model, s} from 'json-joy/lib/json-crdt';
import {CollaborativeInput} from '@jsonjoy.com/collaborative-input-react';
import {Markdown} from '@jsonjoy.com/ui/lib/markdown/Markdown';
import {SideBySideSync} from '../..';
import {DemoCard} from '../../../DemoCard';
import {DESCRIPTION} from './constants';

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

  return (
    <DemoCard
      title={<Markdown inline src={'`CollaborativeInput` Component'} />}
      subtitle={<Markdown inline src={subtitleText} />}
      description={<Markdown src={DESCRIPTION} />}
    >
      <SideBySideSync
        model={model}
        noDisplayHdr
        renderDisplay={(m: Model<any>) => (
          <CollaborativeInput
            str={() => m.api.str(['text'])}
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
