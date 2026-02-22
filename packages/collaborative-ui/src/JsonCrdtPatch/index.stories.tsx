import * as React from 'react';
import {Model, s} from 'json-joy/lib/json-crdt';
import {JsonCrdtPatch} from '.';

export default {
  component: JsonCrdtPatch,
  title: '<JsonCrdtPatch>',
};

const schema0 = s.obj({
  id: s.con<string>(''),
  name: s.str('John Doe'),
  age: s.val(s.con<number>(42)),
  tags: s.arr([s.str('tag1'), s.str('tag2')]),
});

const model = Model.create(schema0);
const patch = model.api.flush();

export const Default = {
  render: () => <JsonCrdtPatch patch={patch} />,
};
