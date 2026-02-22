import * as React from 'react';
import {Checkbox} from '@jsonjoy.com/ui/lib/2-inline-block/Checkbox';
import {FixedColumn} from '@jsonjoy.com/ui/lib/3-list-item/FixedColumn';
import {TitleInput} from './inputs/TitleInput';
import type {JsonPatchStore} from 'json-joy/lib/json-crdt/json-patch/JsonPatchStore';
import type {TodoView} from './types';
import {StrAdapter} from '../../StrAdapter';
import {Background} from './Background';
import {BasicButtonClose} from '@jsonjoy.com/ui/lib/2-inline-block/BasicButton/BasicButtonClose';

export interface ItemProps {
  task: TodoView;
  store: JsonPatchStore<any>;
  index: number;
}

export const Item: React.FC<ItemProps> = ({task, store, index}) => {
  return (
    <Background>
      <FixedColumn right={24}>
        <FixedColumn left={54}>
          <div>
            <Checkbox
              small
              on={!!task.completed}
              onChange={() => {
                store.update({op: 'add', path: ['list', index, 'completed'], value: !task.completed});
              }}
            />
          </div>
          <div>
            <StrAdapter store={store} path={`/list/${index}/text`}>
              {(str) => (str ? <TitleInput fullWidth multiline wrap str={str} /> : null)}
            </StrAdapter>
          </div>
        </FixedColumn>
        <div>
          <BasicButtonClose
            onClick={() => {
              store.update({op: 'remove', path: `/list/${index}`});
            }}
          />
        </div>
      </FixedColumn>
    </Background>
  );
};
