import * as React from 'react';
import {Label} from 'nice-ui/lib/1-inline/Label';
import {Flex} from 'nice-ui/lib/3-list-item/Flex';
import {Row} from './Row';
import {s} from 'json-joy/lib/json-crdt';
import {FlexibleInput} from 'flexible-input';
import type {TagsApi} from './hooks';

export interface TagsProps {
  arr: TagsApi;
}

export const Tags: React.FC<TagsProps> = ({arr}) => {
  const list = React.useSyncExternalStore(arr.events.subscribe, arr.events.getSnapshot) as string[];
  const [name, setName] = React.useState('');

  return (
    <Row title={'Tags'}>
      <Flex style={{alignItems: 'center', width: '100%', flexWrap: 'wrap'}}>
        {list.map((tag: any, i: number) => (
          <span
            key={i}
            style={{cursor: 'not-allowed', paddingRight: '4px', whiteSpace: 'nowrap'}}
            onClick={() => arr.del(i, 1)}
            onKeyDown={() => {}}
          >
            <Label>{tag}</Label>
          </span>
        ))}
        <div style={{padding: '5px 0 5px 4px'}}>
          <FlexibleInput
            value={name}
            onChange={(e) => setName(e.target.value)}
            typeahead={!name ? 'Enter tag' : ''}
            onCancel={() => setName('')}
            onKeyDown={(e) => {
              if (e.key === 'Backspace' && !name) {
                if (list.length) arr.del(list.length - 1, 1);
              }
            }}
            onSubmit={() => {
              arr.ins(list.length, [s.con<string>(name)] as any);
              setName('');
            }}
          />
        </div>
      </Flex>
    </Row>
  );
};
