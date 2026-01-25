import * as React from 'react';
import {Paper} from '@jsonjoy.com/ui/lib/4-card/Paper';
import {MiniTitle} from '@jsonjoy.com/ui/lib/3-list-item/MiniTitle';
import {Separator} from '@jsonjoy.com/ui/lib/3-list-item/Separator';
import {rule} from 'nano-theme';
import type {JsonPatchStore} from 'json-joy/lib/json-crdt/json-patch/JsonPatchStore';
import {NewItem} from './NewItem';
import {List} from './List';
import BasicButton from '@jsonjoy.com/ui/lib/2-inline-block/BasicButton';
import {Flex} from '@jsonjoy.com/ui/lib/3-list-item/Flex';
import {Split} from '@jsonjoy.com/ui/lib/3-list-item/Split';
import {Space} from '@jsonjoy.com/ui/lib/3-list-item/Space';
import {useStore} from '../../hooks/useStore';
import type {TodosView} from './types';

const css = {
  block: rule({
    bxz: 'border-box',
    w: '100%',
    maxW: '600px',
  }),
  title: rule({
    pd: '16px',
    bxz: 'border-box',
    w: '100%',
  }),
  content: rule({
    pd: '16px',
  }),
};

export interface TodosProps {
  store: JsonPatchStore<any>;
}

export const Todos: React.FC<TodosProps> = ({store}) => {
  const [tab, setTab] = React.useState<'completed' | 'in-progress'>('in-progress');
  React.useLayoutEffect(() => {
    try {
      const view = store.getSnapshot() as TodosView;
      if (!view || typeof view !== 'object') return;
      if (!Array.isArray(view.list)) {
        store.update({op: 'add', path: '/list', value: []});
      }
    } catch {}
  }, [store]);

  const view = useStore(store) as TodosView;
  if (!view || typeof view !== 'object') return null;

  const hasCompleted = !!view.list?.find((task) => task.completed);

  const header = (
    <>
      <div className={css.title}>
        <Split style={{alignItems: 'center'}}>
          <MiniTitle>Todos</MiniTitle>
          <div style={{minHeight: 24}}>
            {((!!view.list?.length && hasCompleted) || tab === 'completed') && (
              <Flex style={{alignItems: 'center'}}>
                <BasicButton fill={tab === 'in-progress'} width={'auto'} onClick={() => setTab('in-progress')}>
                  In progress
                </BasicButton>
                <Space horizontal size={-2} />
                <BasicButton
                  fill={tab === 'completed'}
                  width={'auto'}
                  onClick={hasCompleted ? () => setTab('completed') : undefined}
                >
                  Completed{' '}
                  {hasCompleted ? `(${view.list.reduce((acc, todo) => acc + (todo.completed ? 1 : 0), 0)})` : ''}
                </BasicButton>
              </Flex>
            )}
          </div>
        </Split>
      </div>
      <Separator />
    </>
  );

  return (
    <Paper className={css.block} fill={1} round contrast>
      {header}
      <div className={css.content}>
        <List store={store} completed={tab === 'completed'} />
        {tab === 'in-progress' && <NewItem store={store} />}
      </div>
    </Paper>
  );
};
