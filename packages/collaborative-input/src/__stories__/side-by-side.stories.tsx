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

export const Default = {
  render: () => (
    <DemoCard
      title={<Markdown inline src={'`CollaborativeInput` Component'} />}
      subtitle={<Markdown inline src={'Two-way synchronization of basic DOM `<input>` element rendered by `<CollaborativeInput>` React component'} />}
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
