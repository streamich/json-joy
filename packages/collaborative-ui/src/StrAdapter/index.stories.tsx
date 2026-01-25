import * as React from 'react';
import {StrAdapter} from '.';
import {Model, s} from 'json-joy/lib/json-crdt';
import {JsonCrdtModel} from '../JsonCrdtModel';
import {JsonPatchStore} from 'json-joy/lib/json-crdt/json-patch/JsonPatchStore';
import {CollaborativeInput} from '../CollaborativeInput';
import {CollaborativeFlexibleInput} from '../CollaborativeFlexibleInput';

export default {
  component: StrAdapter,
  title: '<StrAdapter>',
};

const schema0 = s.obj({
  id: s.con<string>('xyz'),
  name: s.str('John Doe'),
  age: s.val(s.con<number>(42)),
  tags: s.arr([s.str('tag1'), s.str('tag2')]),
});

const model = Model.create(schema0);
const store = new JsonPatchStore(model);

export const Default = {
  render: () => {
    return (
      <div>
        <StrAdapter store={store} path="/name">
          {(str) => <CollaborativeInput str={str} />}
        </StrAdapter>
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
        <StrAdapter store={store} path="/name">
          {(str) => <CollaborativeFlexibleInput multiline str={str} />}
        </StrAdapter>
        <br />
        <br />
        <JsonCrdtModel model={model} />
      </div>
    );
  },
};
