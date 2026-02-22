import * as React from 'react';
import type {StrApi} from 'json-joy/lib/json-crdt';
import {CollaborativeFlexibleInput} from '../../CollaborativeFlexibleInput';
import {Row} from './Row';

export interface TitleProps {
  str: StrApi;
}

export const Title: React.FC<TitleProps> = ({str}) => {
  const view = React.useSyncExternalStore(str.events.subscribe, str.events.getSnapshot);

  return (
    <Row title={'Title'}>
      <h1 style={{margin: 0, padding: 0, maxWidth: '100%', overflowX: 'auto'}}>
        <CollaborativeFlexibleInput focus str={() => str} typeahead={view ? '' : 'Title'} fullWidth />
      </h1>
    </Row>
  );
};
