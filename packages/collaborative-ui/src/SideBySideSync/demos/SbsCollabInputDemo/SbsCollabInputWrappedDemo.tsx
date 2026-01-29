import * as React from 'react';
import {Model, s} from 'json-joy/lib/json-crdt';
import {Markdown} from '@jsonjoy.com/ui/lib/markdown/Markdown';
import {Input} from '@jsonjoy.com/ui/lib/2-inline-block/Input';
import {SideBySideSync} from '../..';
import {DemoCard} from '../../../DemoCard';
import {DESCRIPTION} from './constants';
import {InputWrapper} from './InputWrapper';

export interface SbsCollabInputWrappedDemoProps {
  initialText?: string;
}

export const SbsCollabInputWrappedDemo: React.FC<SbsCollabInputWrappedDemoProps> = ({initialText = 'Hello...'}) => {
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
          <InputWrapper
            str={() => m.api.str(['text'])}
            input={(ref, value, onChange) => (
              <div ref={ref}>
                {/* <Input value={value} onChange={onChange} /> */}
                <input value={value} onChange={onChange} />
                {/* <input onChange={onChange} /> */}
              </div>
            )}
          />
        )}
      />
    </DemoCard>
  );
};
