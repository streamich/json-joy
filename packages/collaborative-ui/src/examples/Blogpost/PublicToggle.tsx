import * as React from 'react';
import {Checkbox} from '@jsonjoy.com/ui/lib/2-inline-block/Checkbox';
import {Row} from './Row';
import type {BlogpostApi} from './schema';

export interface PublicToggleProps {
  obj: BlogpostApi;
}

export const PublicToggle: React.FC<PublicToggleProps> = ({obj}) => {
  const isPublic = !!React.useSyncExternalStore(obj.events.subscribe, () => obj.get('public').view());

  return (
    <Row title={'Public'}>
      <Checkbox on={isPublic} onChange={() => obj.set({public: !isPublic})} />
    </Row>
  );
};
