import * as React from 'react';
import {JsonCrdtBlock} from '.';
import {JsonCrdtRepo} from 'json-crdt-repo';
import {Block} from './state/Block';
import {JsonPatchStore} from 'json-joy/lib/json-crdt/json-patch/JsonPatchStore';
import {Todos} from '../examples/Todos';
import {s} from 'json-joy/lib/json-crdt';

export default {
  component: JsonCrdtBlock,
  title: '<JsonCrdtBlock>',
};

const repo = new JsonCrdtRepo();
const id = 'storybook-demo-todos';
const schema = s.obj({
  todos: s.obj({
    list: s.arr([]),
  }),
});
const {session} = repo.sessions.make({id: ['demo', id], schema});
const block = new Block(id, session, repo);
const store = new JsonPatchStore(session.model, ['todos']);

export const Default = {
  render: () => (
    <div>
      <Todos store={store} />
      <br />
      <JsonCrdtBlock block={block} />
    </div>
  ),
};
