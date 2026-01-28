import * as React from 'react';
import {Model, s} from 'json-joy/lib/json-crdt';
import {CollaborativeInput} from '@jsonjoy.com/collaborative-input-react';
import {Markdown} from '@jsonjoy.com/ui/lib/markdown/Markdown';
import {Input} from '@jsonjoy.com/ui/lib/2-inline-block/Input';
import {SideBySideSync} from '../..';
import {DemoCard} from '../../../DemoCard';
import {DESCRIPTION} from './constants';
import {StrAdapterNative} from '../../../StrAdapterNative';

export interface SbsCollabInputCustomDemoProps {
  initialText?: string;
}

export const SbsCollabInputCustomDemo: React.FC<SbsCollabInputCustomDemoProps> = ({initialText = 'Hello...'}) => {
  const model = React.useMemo(() => {
    const schema = s.obj({
      text: s.str(initialText),
    });
    return Model.create(schema)
  }, []);
  const [value, setValue] = React.useState(initialText);

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
          <StrAdapterNative value={value} onChange={(val) => setValue(val)}>
            {(str) => (
              <CollaborativeInput
                str={str}
                input={connect => <Input inp={connect} />}
              />
            )}
          </StrAdapterNative>
        )}
      />
    </DemoCard>
  );
};
