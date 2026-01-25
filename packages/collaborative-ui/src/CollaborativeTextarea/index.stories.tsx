import * as React from 'react';
import {CollaborativeTextarea} from '.';
import {Model, s} from 'json-joy/lib/json-crdt';
import {JsonCrdtModel} from '../JsonCrdtModel';

export default {
  component: CollaborativeTextarea,
  title: '<CollaborativeTextarea>',
};

const model = Model.create(s.str('John Doe'));
const str = () => model.s.$;

export const Default = {
  render: () => {
    return (
      <div>
        <CollaborativeTextarea str={str} />
        <br />
        <br />
        <JsonCrdtModel model={model} />
      </div>
    );
  },
};
