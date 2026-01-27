import * as React from 'react';
import {Model, s} from 'json-joy/lib/json-crdt';
import {Codeblock} from '@jsonjoy.com/ui/lib/5-block/Codeblock';
import {SideBySideSync} from '@jsonjoy.com/collaborative-ui/lib/SideBySideSync';
import {UseModel} from '@jsonjoy.com/collaborative-ui/lib/hooks/useModel';
import {CollaborativeInput} from '../CollaborativeInput';

export default {
  title: 'side-by-side',
};

const schema0 = s.obj({
  text: s.str('Hello world!'),
});

const model = Model.create(schema0);

export const Default = {
  render: () => <SideBySideSync
    model={model}
    renderDisplay={(model: Model<any>) => (
      <CollaborativeInput
        str={() => model.api.str(['text'])}
        input={(connect) => (
          <textarea ref={connect} />
        )}
      />
    )}
  />,
};
