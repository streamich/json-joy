import * as React from 'react';
import {Model, s} from 'json-joy/lib/json-crdt';
import {Codeblock} from '@jsonjoy.com/ui/lib/5-block/Codeblock';
import {SideBySideSync} from '.';
import {UseModel} from '../hooks/useModel';

export default {
  component: SideBySideSync,
  title: '<SideBySideSync>',
};

const schema0 = s.obj({
  id: s.con<string>(''),
  name: s.str('John Doe'),
  age: s.val(s.con<number>(42)),
  tags: s.arr([s.str('tag1'), s.str('tag2')]),
});

const model = Model.create(schema0);

export const Default = {
  render: () => (
    <SideBySideSync
      model={model}
      renderDisplay={(model) => (
        <div style={{fontSize: '14px', width: '100%'}}>
          <UseModel model={model} render={() => <Codeblock src={JSON.stringify(model.view())} />} />
        </div>
      )}
    />
  ),
};
