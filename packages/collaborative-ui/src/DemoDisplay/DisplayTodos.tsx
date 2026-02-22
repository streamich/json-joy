import * as React from 'react';
import {JsonPatchStore} from 'json-joy/lib/json-crdt/json-patch/JsonPatchStore';
import {Todos} from '../examples/Todos';
import type {DemoProps} from './types';

export interface DisplayBlogPostProps extends DemoProps {}

const DisplayTodos: React.FC<DisplayBlogPostProps> = ({model, path = []}) => {
  const store = React.useMemo(() => new JsonPatchStore(model), [model]);

  return <Todos store={store} />;
};

export default DisplayTodos;
