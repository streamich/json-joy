import * as React from 'react';
import {CollaborativeInput} from '.';
import {Model, s} from 'json-joy/lib/json-crdt';
import {JsonCrdtModel} from '../JsonCrdtModel';

export default {
  component: CollaborativeInput,
  title: '<CollaborativeInput>',
};

const schema0 = s.obj({
  id: s.con<string>('xyz'),
  name: s.str('John Doe'),
  age: s.val(s.con<number>(42)),
  tags: s.arr([s.str('tag1'), s.str('tag2')]),
});

const model = Model.create(schema0);
const str = () => model.s.name.$;

export const Default = {
  render: () => {
    return (
      <div>
        <CollaborativeInput str={str} />
        <br />
        <br />
        <JsonCrdtModel model={model} />
      </div>
    );
  },
};

export const Multiline = {
  render: () => {
    return (
      <div>
        <CollaborativeInput multiline str={str} />
        <br />
        <br />
        <JsonCrdtModel model={model} />
      </div>
    );
  },
};
