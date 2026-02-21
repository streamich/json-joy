import * as React from 'react';
import {Model, s} from 'json-joy/lib/json-crdt';
import {CollaborativeInput} from '@jsonjoy.com/collaborative-input-react';
import {Markdown} from '@jsonjoy.com/ui/lib/markdown/Markdown';
import {Input} from '@jsonjoy.com/ui/lib/2-inline-block/Input';
import {SideBySideSync} from '../..';
import {DemoCard} from '../../../DemoCard';
import {DESCRIPTION} from './constants';

export interface SbsCollabInputCustomDemoProps {
  initialText?: string;
}

export const SbsCollabInputCustomDemo: React.FC<SbsCollabInputCustomDemoProps> = ({initialText = 'Hello...'}) => {
  const model = React.useMemo(() => {
    const schema = s.obj({
      text: s.str(initialText),
    });
    return Model.create(schema);
  }, []);

  return (
    <DemoCard
      title={<Markdown inline src={'`CollaborativeInput` Component'} />}
      subtitle={<Markdown inline src={'Custom React `<input>` component wrapped with `<CollaborativeInput>`'} />}
      description={<Markdown src={DESCRIPTION} />}
    >
      <SideBySideSync
        model={model}
        noDisplayHdr
        renderDisplay={(m: Model<any>) => (
          <CollaborativeInput
            str={() => m.api.str(['text'])}
            input={(connect) => (
              <div style={{width: '100%', maxWidth: '300px'}}>
                <Input inp={connect} />
              </div>
            )}
          />
        )}
      />
    </DemoCard>
  );
};
