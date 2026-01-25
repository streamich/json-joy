import * as React from 'react';
import type {JsonPatchStore} from 'json-joy/lib/json-crdt/json-patch/JsonPatchStore';
import {Button} from 'nice-ui/lib/2-inline-block/Button';
import {useStore} from '../../hooks/useStore';
import {StrAdapterNative} from '../../StrAdapterNative';
import {TitleInput} from './inputs/TitleInput';
import {Space} from 'nice-ui/lib/3-list-item/Space';
import type {TodosView, TodoView} from './types';
import {Background} from './Background';

export interface NewItemProps {
  store: JsonPatchStore<any>;
}

export const NewItem: React.FC<NewItemProps> = ({store}) => {
  const inputRef = React.useRef<HTMLTextAreaElement | null>(null);
  const view = useStore(store) as TodosView;
  const [text, setText] = React.useState('');

  if (!Array.isArray(view.list)) {
    return null;
  }

  return (
    <Background>
      <StrAdapterNative value={text} onChange={(next) => setText(next)}>
        {(str) => (
          <TitleInput
            inp={(el) => (inputRef.current = el as HTMLTextAreaElement)}
            fullWidth
            multiline
            wrap
            typeahead={text ? '' : 'Add task'}
            str={str}
          />
        )}
      </StrAdapterNative>
      {!!text && <Space size={-1} />}
      {!!text && (
        <Button
          size={-1}
          block
          onClick={() => {
            const task: TodoView = {
              id: Math.random().toString(36).slice(2),
              text: text,
              completed: false,
            };
            setText('');
            store.update({op: 'add', path: '/list/-', value: task});
            const input = inputRef.current;
            if (input) input.focus();
          }}
        >
          Add
        </Button>
      )}
    </Background>
  );
};
