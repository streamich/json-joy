import * as React from 'react';
import {Paper} from '@jsonjoy.com/ui/lib/4-card/Paper';
import {useSideBySideSyncState} from './context';
import {JsonCrdtModelProps} from '../JsonCrdtModel';
import {Button} from '@jsonjoy.com/ui/lib/2-inline-block/Button';
import type {Model} from 'json-joy/lib/json-crdt';

export interface TopBarProps {
  model: Model<any>;
  renderDisplay?: JsonCrdtModelProps['renderDisplay'];
}

export const TopBar: React.FC<Omit<TopBarProps, 'model'>> = ({renderDisplay}) => {
  const state = useSideBySideSyncState();

  return (
    <Paper contrast style={{margin: '-1px -1px 2px', padding: 16}}>
      <Button size={-2} compact onClick={state.synchronize}>Synchronize</Button>
    </Paper>
  );
};
