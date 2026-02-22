import * as React from 'react';
import type {JsonPatchStore} from 'json-joy/lib/json-crdt/json-patch/JsonPatchStore';
import type {TodosView} from './types';
import {useStore} from '../../hooks/useStore';
import {Item} from './Item';

export interface ListProps {
  store: JsonPatchStore<any>;
  completed?: boolean;
}

export const List: React.FC<ListProps> = ({store, completed}) => {
  const view = useStore(store) as TodosView;

  if (!view || typeof view !== 'object' || !Array.isArray(view.list)) {
    return null;
  }

  return (
    <>
      {view.list.map((todo, index) => {
        if (!todo) return null;
        if (completed && !todo.completed) return null;
        if (!completed && todo.completed) return null;
        return <Item key={todo.id} task={todo} store={store} index={index} />;
      })}
    </>
  );
};
