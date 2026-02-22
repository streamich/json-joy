import * as React from 'react';
import {CollaborativeFlexibleInput} from '.';
import {Model, s} from 'json-joy/lib/json-crdt';
import {JsonCrdtModel} from '../JsonCrdtModel';

export default {
  component: CollaborativeFlexibleInput,
  title: '<CollaborativeFlexibleInput>',
};

const model = Model.create(s.str('John Doe'));
const str = () => model.s.$;

export const Default = {
  render: () => {
    return (
      <div>
        <CollaborativeFlexibleInput str={str} />
        <br />
        <br />
        <JsonCrdtModel model={model} renderDisplay={() => <CollaborativeFlexibleInput str={str} />} />
      </div>
    );
  },
};

export const Multiline = {
  render: () => {
    return (
      <div>
        <CollaborativeFlexibleInput multiline str={str} />
        <br />
        <br />
        <JsonCrdtModel
          model={model}
          renderDisplay={() => <CollaborativeFlexibleInput fullWidth multiline str={str} />}
        />
      </div>
    );
  },
};
